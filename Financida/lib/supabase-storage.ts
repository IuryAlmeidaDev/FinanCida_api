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

function getFileExtension(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase()
  return extension && extension.length <= 6 ? extension : "png"
}

export async function uploadProfileAvatar(userId: string, file: File) {
  const { supabaseUrl, serviceRoleKey, bucketName } = getSupabaseStorageConfig()
  const fileExtension = getFileExtension(file.name)
  const filePath = `profiles/${userId}/${crypto.randomUUID()}.${fileExtension}`
  const fileBuffer = Buffer.from(await file.arrayBuffer())

  const response = await fetch(
    `${supabaseUrl}/storage/v1/object/${bucketName}/${filePath}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
        "Content-Type": file.type || "application/octet-stream",
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
