package com.example.wordtopdf

import com.example.wordtopdf.domain.ConversionResult
import com.example.wordtopdf.domain.ConvertDocxToPdfUseCase
import com.example.wordtopdf.domain.DocxToPdfConverter
import kotlinx.coroutines.test.runTest
import kotlin.test.Test
import kotlin.test.assertTrue

class ConvertDocxToPdfUseCaseTest {

    @Test
    fun rejectsEmptyInputUri() = runTest {
        val useCase = ConvertDocxToPdfUseCase(FakeConverter())
        val result = useCase("", "/tmp", "out.pdf")
        assertTrue(result is ConversionResult.Failure)
    }

    @Test
    fun rejectsEmptyOutputDirectory() = runTest {
        val useCase = ConvertDocxToPdfUseCase(FakeConverter())
        val result = useCase("content://sample/ornek.docx", "", "out.pdf")
        assertTrue(result is ConversionResult.Failure)
    }

    private class FakeConverter : DocxToPdfConverter {
        override suspend fun convert(
            inputUri: String,
            outputDirectory: String,
            outputFileName: String
        ): ConversionResult {
            return ConversionResult.Success("$outputDirectory/$outputFileName")
        }
    }
}
