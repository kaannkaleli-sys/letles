package com.example.wordtopdf.data

import com.example.wordtopdf.domain.ConversionResult
import com.example.wordtopdf.domain.DocxToPdfConverter
import kotlinx.coroutines.delay

class FakeDocxToPdfConverter : DocxToPdfConverter {
    override suspend fun convert(inputUri: String, outputFileName: String): ConversionResult {
        delay(1200)

        return if (inputUri.endsWith(".docx", ignoreCase = true)) {
            ConversionResult.Success("/storage/emulated/0/Download/$outputFileName")
        } else {
            ConversionResult.Failure("Şu an yalnızca .docx destekleniyor")
        }
    }
}
