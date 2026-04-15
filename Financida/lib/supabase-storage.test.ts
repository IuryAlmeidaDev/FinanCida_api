import { describe, expect, it } from "vitest"

import { validateAvatarFile } from "@/lib/supabase-storage"

describe("avatar storage validation", () => {
  it("aceita imagens permitidas", () => {
    const result = validateAvatarFile(
      new File(["avatar"], "avatar.png", { type: "image/png" })
    )

    expect(result).toEqual({
      contentType: "image/png",
      fileExtension: "png",
    })
  })

  it("rejeita tipos de arquivo fora da lista permitida", () => {
    expect(() =>
      validateAvatarFile(
        new File(["<svg></svg>"], "avatar.svg", { type: "image/svg+xml" })
      )
    ).toThrow("Formato de imagem nao permitido.")
  })

  it("rejeita imagens maiores que 2 MB", () => {
    const file = new File([new Uint8Array(2 * 1024 * 1024 + 1)], "avatar.png", {
      type: "image/png",
    })

    expect(() => validateAvatarFile(file)).toThrow(
      "Imagem muito grande. Envie um arquivo de ate 2 MB."
    )
  })
})
