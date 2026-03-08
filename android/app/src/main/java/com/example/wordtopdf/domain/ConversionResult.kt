package com.example.wordtopdf.domain

sealed class ConversionResult {
    data class Success(val outputPath: String) : ConversionResult()
    data class Failure(val reason: String) : ConversionResult()
}
