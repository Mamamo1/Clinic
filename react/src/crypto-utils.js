import CryptoJS from "crypto-js"

// Get the secret key from environment variables
const getSecretKey = () => {
  const key = import.meta.env.VITE_AES_SECRET_KEY || import.meta.env.REACT_APP_AES_SECRET_KEY
  if (!key) {
    console.warn("[v0] No AES secret key found in environment variables")
    return null
  }

  // Laravel APP_KEY format: "base64:xxxxx" or raw key
  if (key.startsWith("base64:")) {
    // Laravel base64-encoded key format
    const base64Key = key.substring(7) // Remove "base64:" prefix
    const parsedKey = CryptoJS.enc.Base64.parse(base64Key)
    return parsedKey
  } else {
    // Raw key - hash it to get consistent 32-byte key
    const hashedKey = CryptoJS.SHA256(key)
    return hashedKey
  }
}

const tryDifferentKeys = (encryptedData, iv, ciphertext) => {
  const rawKey = import.meta.env.VITE_AES_SECRET_KEY || import.meta.env.REACT_APP_AES_SECRET_KEY

  // Try different key derivations that Laravel might use for AES-128
  const keyVariations = []

  // Laravel uses the raw key bytes directly for AES-128, not hashed
  if (!rawKey.startsWith("base64:")) {
    try {
      // Laravel might use the raw key as-is for AES-128 (no hashing)
      const rawKeyBytes = CryptoJS.enc.Utf8.parse(rawKey)
      keyVariations.push({
        name: "Laravel raw key (no hashing)",
        key: rawKeyBytes,
      })

      // Laravel might pad the raw key to exactly 32 bytes for AES-128
      const paddedRawKey = rawKey.padEnd(32, rawKey).substring(0, 32)
      keyVariations.push({
        name: "Laravel padded raw key (32 bytes)",
        key: CryptoJS.enc.Utf8.parse(paddedRawKey),
      })

      // Try the key exactly as Laravel's Encrypter class would handle it
      const laravelKey = CryptoJS.enc.Base64.parse(rawKey + "==") // Add padding if needed
      keyVariations.push({
        name: "Laravel Encrypter format",
        key: laravelKey,
      })
    } catch (e) {
    }
  }

  if (rawKey.startsWith("base64:")) {
    const base64Key = rawKey.substring(7)
    keyVariations.push({
      name: "Laravel base64 full key",
      key: CryptoJS.enc.Base64.parse(base64Key),
    })

    // Try truncated key for AES-128 (16 bytes)
    const fullKey = CryptoJS.enc.Base64.parse(base64Key)
    const truncatedKey = CryptoJS.lib.WordArray.create(fullKey.words.slice(0, 4)) // 16 bytes
    keyVariations.push({
      name: "Laravel base64 truncated (16 bytes)",
      key: truncatedKey,
    })
  } else {
    // Laravel might treat non-prefixed keys as base64 for AES-128
    try {
      const directBase64Key = CryptoJS.enc.Base64.parse(rawKey)
      keyVariations.push({
        name: "Direct base64 decode (no prefix)",
        key: directBase64Key,
      })

      // Also try truncated version
      const truncatedDirectKey = CryptoJS.lib.WordArray.create(directBase64Key.words.slice(0, 4))
      keyVariations.push({
        name: "Direct base64 decode truncated (16 bytes)",
        key: truncatedDirectKey,
      })
    } catch (e) {
    }

    // Raw key variations
    keyVariations.push({
      name: "SHA256 of raw key",
      key: CryptoJS.SHA256(rawKey),
    })

    keyVariations.push({
      name: "Raw key as UTF8",
      key: CryptoJS.enc.Utf8.parse(rawKey),
    })

    // Try first 16 bytes of SHA256 for AES-128
    const fullHash = CryptoJS.SHA256(rawKey)
    const truncatedHash = CryptoJS.lib.WordArray.create(fullHash.words.slice(0, 4))
    keyVariations.push({
      name: "First 16 bytes of SHA256",
      key: truncatedHash,
    })

    // Try variations that might have been used when Laravel was set to AES-256
    keyVariations.push({
      name: "AES-256 SHA256 of raw key (old format)",
      key: CryptoJS.SHA256(rawKey),
    })

    // Try the raw key padded to 32 bytes for AES-256
    const paddedKey = CryptoJS.enc.Utf8.parse(rawKey.padEnd(32, "\0"))
    keyVariations.push({
      name: "AES-256 padded raw key",
      key: paddedKey,
    })

    // Try the raw key repeated to fill 32 bytes
    const repeatedKey = rawKey.repeat(Math.ceil(32 / rawKey.length)).substring(0, 32)
    keyVariations.push({
      name: "AES-256 repeated raw key",
      key: CryptoJS.enc.Utf8.parse(repeatedKey),
    })
  }

  // Try each key variation
  for (const variation of keyVariations) {
    try {
      const cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: ciphertext,
      })

      const decrypted = CryptoJS.AES.decrypt(cipherParams, variation.key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      })

      const decryptedText = decrypted.toString(CryptoJS.enc.Utf8)

      if (decryptedText.length > 0) {
        return decryptedText
      }
    } catch (error) {
    }
  }

  return null
}

// Decrypt Laravel-compatible AES encrypted data
export const decryptData = (encryptedData) => {
  try {
    const secretKey = getSecretKey()
    if (!secretKey) {
      return encryptedData
    }

    if (!encryptedData || typeof encryptedData !== "string") {
      return encryptedData
    }

    let payload
    try {
      // Laravel may wrap the encrypted data in a JSON payload
      const decoded = atob(encryptedData)
      payload = JSON.parse(decoded)

      if (payload.value) {
        // Laravel 5.5+ format with JSON payload
        const iv = CryptoJS.enc.Base64.parse(payload.iv)
        const ciphertext = CryptoJS.enc.Base64.parse(payload.value)
        const decrypted = CryptoJS.AES.decrypt(

          CryptoJS.lib.CipherParams.create({ ciphertext: ciphertext }),
          secretKey,
          {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
          },
        )

        const decryptedText = decrypted.toString(CryptoJS.enc.Utf8)

        if (decryptedText.length > 0) {
          return decryptedText
        }
      }
    } catch (e) {
    }

    // Fallback to direct base64 format (older Laravel or custom format)
    const encrypted = CryptoJS.enc.Base64.parse(encryptedData)

    // Extract IV (first 16 bytes) and ciphertext (rest)
    const iv = CryptoJS.lib.WordArray.create(encrypted.words.slice(0, 4))
    const ciphertext = CryptoJS.lib.WordArray.create(encrypted.words.slice(4))
    const result = tryDifferentKeys(encryptedData, iv, ciphertext)

    if (result) {
      return result
    }
    return encryptedData
  } catch (error) {
    return encryptedData
  }
}

// Encrypt data (Laravel-compatible format)
export const encryptData = (data) => {
  try {
    const secretKey = getSecretKey()
    if (!secretKey) {
      console.warn("[v0] No secret key available for encryption")
      return data
    }

    // Generate random IV
    const iv = CryptoJS.lib.WordArray.random(16)

    // Encrypt
    const encrypted = CryptoJS.AES.encrypt(data, secretKey, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    })

    // Combine IV + encrypted data and encode as base64
    const combined = iv.concat(encrypted.ciphertext)
    return CryptoJS.enc.Base64.stringify(combined)
  } catch (error) {
    console.error("[v0] Encryption failed:", error)
    return data
  }
}

// Decrypt user data object
export const decryptUserData = (userData) => {
  if (!userData || typeof userData !== "object") {
    return userData
  }

  const fieldsToDecrypt = [
    "mobile",
    "telephone",
    "mobile_number",
    "phone_number",
    "emergency_contact_name",
    "emergency_contact_number",
    "street",
    "address",
    "city",
    "province",
    "state",
  ]

  const decryptedData = { ...userData }

  fieldsToDecrypt.forEach((field) => {
    if (decryptedData[field]) {
      const originalValue = decryptedData[field]
      const decryptedValue = decryptData(originalValue)

      if (decryptedValue !== originalValue) {
        decryptedData[field] = decryptedValue
      }
    }
  })

  return decryptedData
}
