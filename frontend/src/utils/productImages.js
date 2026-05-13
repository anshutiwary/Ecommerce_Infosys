const assetModules = import.meta.glob(
  '../assets/**/*.{png,jpg,jpeg,webp}',
  {
    eager: true,
    import: 'default',
    query: '?url',
  },
)

const normalizeImageKey = (value = '') =>
  String(value)
    .toLowerCase()
    .replaceAll('mackbook', 'macbook')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

const getKeyTokens = (value = '') =>
  normalizeImageKey(value)
    .split(' ')
    .filter(Boolean)

const localProductImages = Object.entries(assetModules)
  .filter(([path]) => !path.includes('auth-background'))
  .map(([path, url]) => {
    const parts = path.split('/')
    const fileName = parts.at(-1) || ''
    const folderName = parts.at(-2) || ''
    const fileNameWithoutExtension = fileName.replace(/\.[^.]+$/, '')
    const label = folderName === 'assets' ? fileNameWithoutExtension : folderName

    return {
      label,
      key: normalizeImageKey(label),
      fileKey: normalizeImageKey(fileNameWithoutExtension),
      tokens: getKeyTokens(label),
      url,
    }
  })

const getProductKeys = (product = {}) =>
  [
    product.name,
    product.productName,
    product.title,
    product.model,
    product.productId,
    product.id,
    product._id,
    product.sku,
    product.category,
  ]
    .map(normalizeImageKey)
    .filter(Boolean)

export function getProductImageUrl(product = {}) {
  if (product.imageUrl) {
    return product.imageUrl
  }

  const productKeys = getProductKeys(product)
  const productTokens = new Set(productKeys.flatMap(getKeyTokens))

  const matchedImage = localProductImages
    .map((image) => {
      const textMatchScore = productKeys.some((productKey) =>
      productKey === image.key ||
      productKey.includes(image.key) ||
      image.key.includes(productKey) ||
      productKey.includes(image.fileKey),
      )
        ? image.tokens.length + 10
        : 0
      const tokenMatchScore = image.tokens.every((token) => productTokens.has(token))
        ? image.tokens.length
        : 0

      return {
        ...image,
        score: Math.max(textMatchScore, tokenMatchScore),
      }
    })
    .filter((image) => image.score > 0)
    .sort((first, second) => second.score - first.score)[0]

  return matchedImage?.url || ''
}
