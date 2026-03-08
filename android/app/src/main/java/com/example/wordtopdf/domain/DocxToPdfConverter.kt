package com.example.wordtopdf.domain

interface DocxToPdfConverter {
    suspend fun convert(inputUri: String, outputFileName: String): ConversionResult
}
