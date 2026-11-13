/**
 * The single indirection point for the generated image manifest.
 *
 * Normal builds use images.json untouched (full srcset). The single-file
 * standalone build aliases this module to a collapsed manifest with one
 * rendition per photo, so the HTML doesn't carry the same image ten times.
 */
import images from './images.json'

export default images
