package com.example.wordtopdf.domain

interface DocxToPdfConverter {
    suspend fun convert(inputUri: String, outputDirectory: String, outputFileName: String): ConversionResult
}
