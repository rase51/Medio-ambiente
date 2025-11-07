export async function compressImage(base64: string, maxWidth = 800, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement("canvas")
      let width = img.width
      let height = img.height

      // Redimensionar si es necesario
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext("2d")
      if (!ctx) {
        reject(new Error("No se pudo obtener contexto del canvas"))
        return
      }

      ctx.drawImage(img, 0, 0, width, height)

      // Comprimir a JPEG con calidad específica
      const compressed = canvas.toDataURL("image/jpeg", quality)
      resolve(compressed)
    }

    img.onerror = () => reject(new Error("Error al cargar la imagen"))
    img.src = base64
  })
}
