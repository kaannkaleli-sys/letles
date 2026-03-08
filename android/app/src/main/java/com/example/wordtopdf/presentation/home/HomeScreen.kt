package com.example.wordtopdf.presentation.home

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.example.wordtopdf.presentation.MainUiState

@Composable
fun HomeScreen(
    state: MainUiState,
    onSelectPhoneSource: () -> Unit,
    onSelectDriveSource: () -> Unit,
    onPickWordFile: () -> Unit,
    onPickSaveDirectory: () -> Unit,
    onConvertClick: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("Word → PDF", style = MaterialTheme.typography.headlineSmall)
        Text("Kaynak seç, Word dosyasını aç, kayıt klasörünü seç")

        Text("1) Dosya kaynağı", modifier = Modifier.padding(top = 14.dp))
        Button(onClick = onSelectPhoneSource, modifier = Modifier.padding(top = 8.dp)) { Text("Telefon Depolama") }
        Button(onClick = onSelectDriveSource, modifier = Modifier.padding(top = 8.dp)) { Text("Google Drive") }

        if (state.selectedSource.isNotBlank()) {
            Text("Kaynak: ${state.selectedSource}", modifier = Modifier.padding(top = 10.dp))
            Button(onClick = onPickWordFile, modifier = Modifier.padding(top = 8.dp)) { Text("Word dosyası seç") }
        }

        if (state.selectedFileName.isNotBlank()) {
            Text("Dosya: ${state.selectedFileName}", modifier = Modifier.padding(top = 10.dp))
            Button(onClick = onPickSaveDirectory, modifier = Modifier.padding(top = 8.dp)) { Text("PDF kayıt klasörü seç") }
        }

        if (state.selectedSaveLocation.isNotBlank()) {
            Text("Klasör seçildi", modifier = Modifier.padding(top = 10.dp))
            Button(onClick = onConvertClick, modifier = Modifier.padding(top = 10.dp)) {
                Text("PDF'e dönüştür")
            }
        }

        if (!state.errorMessage.isNullOrBlank()) {
            Text(
                text = state.errorMessage,
                color = MaterialTheme.colorScheme.error,
                modifier = Modifier.padding(top = 12.dp)
            )
        }
    }
}
