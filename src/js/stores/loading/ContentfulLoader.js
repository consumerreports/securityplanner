import SimpleSignal from "simplesignal";
import { createClient } from "contentful";

export default class ContentfulLoader {

	/**
	 * Loads ALL data from Contentful, paginating as needed.
	 * This makes no distinction between specific data models.
	 * It just attempts to parse between Entries and Assets.
	 */

	// ================================================================================================================
	// CONSTRUCTOR ----------------------------------------------------------------------------------------------------

	constructor(space, accessToken, isPreviewing = false, localizeAssets = false) {
		this.onComplete = new SimpleSignal();
		this._localizeAssets = localizeAssets;
		this._limit = 1000; // MAX = 1000
		this._isLoading = false;
		this._isLoaded = false;
		this._isPreviewing = isPreviewing;
		this._rawEntries = [];
		this._rawAssets = [];
		this._entries = {}; // object with { key: id, value : [] }
		this._assets = {}; // object with { key: internal id, value = { id: title, url: url, width: number, height: number }

		this.metadata = {}; // .updatedAt, .items (id: { .id, .type, .createdAt, .updatedAt, .revision })

		this._client = createClient({
			space: space,
			accessToken: accessToken,
			host: isPreviewing ? "preview.contentful.com" : undefined,
		});
	}


	// ================================================================================================================
	// PUBLIC INTERFACE -----------------------------------------------------------------------------------------------

	load() {
		if (!this._isLoading) {
			this._isLoading = true;
			this._rawEntries = [];
			this._rawAssets = [];
			this.loadNextEntries();
		}
	}

	isLoaded() {
		return this._isLoaded;
	}

	getAssets() {
		return this._assets;
	}

	getEntries() {
		return this._entries;
	}


	// ================================================================================================================
	// INTERNAL INTERFACE ---------------------------------------------------------------------------------------------

	/**
	 * Request the next batch of entries
	 */
	loadNextEntries() {
		this._client.getEntries({
			include: 0,
			skip: this._rawEntries.length,
			limit: this._limit,
			order: "sys.createdAt",
			locale: "*",
		}).then((entries) => {
			this.parseEntries(entries);
		});
	}

	/**
	 * Once a batch of entries is loaded, add to the list
	 * and check the status to continue with the next batch if needed
	 */
	parseEntries(entries) {
		this._rawEntries = this._rawEntries.concat(entries.items);

		if (this._rawEntries.length < entries.total) {
			// More needed, try again
			this.loadNextEntries();
		} else {
			// Finished loading, continue with asset loading
			this.loadNextAssets();
		}
	}

	/**
	 * Request the next batch of assets
	 * We assume assets are never localized
	 */
	loadNextAssets() {
		this._client.getAssets({
			include: 0,
			skip: this._rawAssets.length,
			limit: this._limit,
			order: "sys.createdAt",
			locale: this._localizeAssets ? "*" : undefined,
		}).then((assets) => {
			this.parseAssets(assets);
		});
	}

	/**
	 * Once a batch of assets is loaded, add to the list
	 * and check the status to continue with the next batch if needed
	 */
	parseAssets(assets) {
		this._rawAssets = this._rawAssets.concat(assets.items);

		if (this._rawAssets.length < assets.total) {
			// More needed, try again
			this.loadNextAssets();
		} else {
			// Finished loading, continue with final parsing
			this.finalizeParsing();
		}
	}

	/**
	 * Once all data is loaded, create a more massaged list of data
	 */
	finalizeParsing() {
		// console.log("Loaded " + this._rawEntries.length + " entries and " + this._rawAssets.length + " assets.");

		this.finalizeParsingAssets();
		this.finalizeParsingEntries();
		this.finalizeParsingMetadata();

		this._isLoading = false;
		this._isLoaded = true;
		this.onComplete.dispatch(this);
	}

	/**
	 * Collects all assets into a single list
	 * We assume assets are not localized. More work has to be done to properly localize them.
	 */
	finalizeParsingAssets() {
		this._assets = {};
		this._rawAssets.forEach(asset => {
			if (!asset.fields.file) {
				return;
			}
			const assetObject = {
				_id: asset.sys.id,
				id: asset.fields.title,
				url: this.createLocalizedFieldFromChild(asset.fields.file, "url"),
				width: this.createLocalizedFieldFromChild(asset.fields.file, "details.image.width"),
				height: this.createLocalizedFieldFromChild(asset.fields.file, "details.image.height"),
			};
			this._assets[assetObject._id] = assetObject;
		});
	}

	/**
	 * Collects all entries into arrays, using their type as a key
	 */
	finalizeParsingEntries() {
		this._entries = {};
		this._rawEntries.forEach(entry => {
			const entryType = entry.sys.contentType.sys.id;

			// Create entry type object if new
			if (!this._entries.hasOwnProperty(entryType)) this._entries[entryType] = [];

			// Create the entry object
			const entryObject = Object.assign({}, entry.fields, {
				_id: entry.sys.id,
			});

			this._entries[entryType].push(entryObject);
		});
	}

	/**
	 * Parses all the data available to construct some metadata
	 */
	finalizeParsingMetadata() {
		this.metadata = {
			updatedAt: undefined,
			items: {},
		};

		this._rawAssets.forEach(asset => {
			this.finalizeParsingMetadataItem(asset.sys.id, "asset", asset.sys.createdAt, asset.sys.updatedAt, asset.sys.revision);
		});
		this._rawEntries.forEach(entry => {
			this.finalizeParsingMetadataItem(entry.sys.id, entry.sys.contentType.sys.id, entry.sys.createdAt, entry.sys.updatedAt, entry.sys.revision);
		});
	}

	/**
	 * Parses one item metadata, adding to our metadata object
	 */
	finalizeParsingMetadataItem(id, type, createdAt, updatedAt, revision) {
		const timeCreated = new Date(createdAt);
		const timeUpdated = new Date(updatedAt);
		if (this.metadata.updatedAt == undefined || this.metadata.updatedAt.getTime() < timeUpdated.getTime()) {
			this.metadata.updatedAt = timeUpdated;
		}
		this.metadata.items[id] = {
			id: id,
			type: type,
			createdAt: timeCreated,
			updatedAt: timeUpdated,
			revision: revision,
		};
	}

	/**
	 * Finds the value of a specific field in a localized child node, and turns that into a localized field.
	 * Useful when loading assets in a localized manner.
	 *
	 * In other words, it turns this:
	 *     { 'en-US': { name: 'English' }, 'ar-001': {name: 'Arabic'} }
	 *     "name"
	 * Into this:
	 *     { 'en-US': 'US', 'ar-001': 'Arabic' }
	 */
	createLocalizedFieldFromChild(child, fieldName) {
		// If it's a string, just return it
		if (typeof(child) === "string") return child;

		// If it's not localized, just return it
		if (this.hasOwnProperties(child, fieldName)) return this.getChildren(child, fieldName);

		const newChild = {};
		for (const key in child) {
			newChild[key] = this.getChildren(child[key], fieldName);
		}
		return newChild;
	}

	/**
	 * Return whether a node has a deep path of attribute nodes (e.g. "node1.node2")
	 */
	hasOwnProperties(node, fieldName) {
		const fieldNames = fieldName.split(".");

		if (fieldNames.length == 1) {
			return node.hasOwnProperty(fieldNames[0]);
		} else {
			return node.hasOwnProperty(fieldNames[0]) && this.hasOwnProperties(node[fieldNames[0]], fieldNames.slice(1).join("."));
		}
	}

	/**
	 * Return a specific child of a node by a "child1.child2" path
	 */
	getChildren(node, path) {
		const paths = path.split(".");
		let valueChild = node;
		paths.forEach(pathPart => {
			valueChild = valueChild[pathPart];
		});
		return valueChild;
	}
}
