package com.example.wordtopdf.domain

class ConvertDocxToPdfUseCase(
    private val converter: DocxToPdfConverter
) {
    suspend operator fun invoke(
        inputUri: String,
        outputDirectory: String,
        outputFileName: String
    ): ConversionResult {
        if (inputUri.isBlank()) return ConversionResult.Failure("Geçersiz dosya")
        if (outputDirectory.isBlank()) return ConversionResult.Failure("Kayıt konumu seçin")
        if (!outputFileName.endsWith(".pdf")) return ConversionResult.Failure("Çıktı uzantısı .pdf olmalı")

        return converter.convert(inputUri, outputDirectory, outputFileName)
    }
}
