$ErrorActionPreference = "Stop"

$root = Read-Host "Root directory to scan"

if (!(Test-Path $root -PathType Container)) {
    Write-Host "[-] Directory not found: $root"
    exit
}

$key = [Convert]::FromBase64String("OoIsAwwF23cICQoLDA0ODe==")
$iv  = [byte[]](
    0, 1, 0, 3, 5, 3, 0, 1,
    0, 0, 2, 0, 6, 7, 6, 0
)

$files = Get-ChildItem -Path $root -Filter "*.fun" -File -Recurse
Write-Host "[*] Found $($files.Count) encrypted files."

foreach ($file in $files) {
    $filename = $file.FullName
    $outputPath = [IO.Path]::Combine(
        $file.DirectoryName,
        $file.BaseName
    )
    try {
        $ciphertext = [IO.File]::ReadAllBytes($filename)
        if ($ciphertext.Length -le 16) {
            throw "File is too small"
        }

        $aes = New-Object System.Security.Cryptography.AesManaged
        $aes.Key = $key
        $aes.IV = $iv
        $decryptor = $aes.CreateDecryptor()

        $plaintext = $decryptor.TransformFinalBlock(
            $ciphertext,
            16,
            $ciphertext.Length - 16
        )

        if ($plaintext.Length -le 16) {
            throw "Invalid decrypted data"
        }

        [IO.File]::WriteAllBytes(
            $outputPath,
            $plaintext[16..($plaintext.Length - 1)]
        )
        Write-Host "[+] $filename"
        Write-Host "    -> $outputPath"
    }
    catch {
        Write-Host "[-] FAILED: $filename"
        Write-Host "    $($_.Exception.Message)"
    }
    finally {
        if ($aes) {
            $aes.Dispose()
        }
    }
}

Write-Host ""
Write-Host "[+] Decryption scan completed."
