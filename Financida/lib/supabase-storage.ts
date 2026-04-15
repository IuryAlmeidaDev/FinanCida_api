function getSupabaseStorageConfig() {
  const supabaseUrl = process.env.SUPABASE_URL ?? ""
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""
  const bucketName = process.env.SUPABASE_STORAGE_BUCKET ?? "avatars"

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY nao configurada.")
  }

  return {
    supabaseUrl,
    serviceRoleKey,
    bucketName,
  }
}

export const maxAvatarFileSizeBytes = 2 * 1024 * 1024

const allowedAvatarContentTypes = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const

export function validateAvatarFile(file: File) {
  const fileExtension =
    allowedAvatarContentTypes[
      file.type as keyof typeof allowedAvatarContentTypes
    ]

  if (!fileExtension) {
    throw new Error("Formato de imagem nao permitido.")
  }

  if (file.size > maxAvatarFileSizeBytes) {
    throw new Error("Imagem muito grande. Envie um arquivo de ate 2 MB.")
  }

  if (file.size === 0) {
    throw new Error("Arquivo de imagem vazio.")
  }

  return {
    contentType: file.type,
    fileExtension,
  }
}

export async function uploadProfileAvatar(userId: string, file: File) {
  const { supabaseUrl, serviceRoleKey, bucketName } = getSupabaseStorageConfig()
  const { contentType, fileExtension } = validateAvatarFile(file)
  const filePath = `profiles/${userId}/${crypto.randomUUID()}.${fileExtension}`
  const fileBuffer = Buffer.from(await file.arrayBuffer())

  const response = await fetch(
    `${supabaseUrl}/storage/v1/object/${bucketName}/${filePath}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
        "Content-Type": contentType,
        "x-upsert": "true",
      },
      body: fileBuffer,
    }
  )

  if (!response.ok) {
    throw new Error("Nao foi possivel enviar a imagem para o Supabase Storage.")
  }

  return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${filePath}`
}
