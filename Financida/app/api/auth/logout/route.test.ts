import { describe, expect, it } from "vitest"

import { GET } from "@/app/api/auth/logout/route"

describe("logout API", () => {
  it("limpa o cookie e redireciona para a raiz", async () => {
    const response = await GET(new Request("http://localhost/api/auth/logout"))

    expect(response.headers.get("location")).toBe("http://localhost/")
    expect(response.headers.get("set-cookie")).toContain("financida_auth_token")
  })
})