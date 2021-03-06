import React, { useState } from "react";
import { Image, Text, TextInput, View } from "react-native";
import { ArrowLeft } from "phosphor-react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import * as FileSystem from 'expo-file-system'
import { styles } from "./styles";
import { theme } from "../../theme";
import { FeedbackType } from "../Widget";
import { feedbackTypes } from "../../utils/feedbackTypes";
import { ScreenButton } from "../ScreenButton";
import { Button } from "../Button";
import { captureScreen } from "react-native-view-shot";
import { api } from "../../libs/api";

interface Props {
  feedbackType: FeedbackType;
  onFeedbackCanceled: () => void;
  onFeedbackSent: () => void;
}

export function Form({
  feedbackType,
  onFeedbackCanceled,
  onFeedbackSent,
}: Props) {
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [comment, setComment] = useState("")

  function handleScreenshot() {
    captureScreen({
      format: "jpg",
      quality: 0.8,
    })
      .then((uri) => setScreenshot(uri))
      .catch((error) => console.error(error));
  }

  function handleScreenshotRemove() {
    setScreenshot(null);
  }

  async function handleSendFeedback() {
    if (isSendingFeedback) return;

    setIsSendingFeedback(true);
    const screenshotBase64 = screenshot && await FileSystem.readAsStringAsync(screenshot, { encoding: 'base64' })

    try {
      await api.post('/feedbacks', {
        type: feedbackType,
        comment,
        screenshot: `data:image/png;base64, ${screenshotBase64}`
      })

      onFeedbackSent()
    } catch (error) {
      console.error(error)
      setIsSendingFeedback(false)
    }
  }

  const feedbackTypeInfo = feedbackTypes[feedbackType];
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onFeedbackCanceled}>
          <ArrowLeft
            size={24}
            weight="bold"
            color={theme.colors.text_secondary}
          />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Image source={feedbackTypeInfo.image} style={styles.image} />
          <Text style={styles.titleText}>{feedbackTypeInfo.title}</Text>
        </View>
      </View>

      <TextInput
        multiline
        style={styles.input}
        placeholder="Algo n??o est?? funcionando bem? Queremos corrigir. Conte com detalhes o que est?? acontecendo..."
        placeholderTextColor={theme.colors.text_secondary}
        autoCorrect={false}
        onChangeText={setComment}
      />
      <View style={styles.footer}>
        <ScreenButton
          onRemoveShot={handleScreenshotRemove}
          onTakeShot={handleScreenshot}
          screenshot={screenshot}
        />

        <Button onPress={handleSendFeedback} isLoading={isSendingFeedback} />
      </View>
    </View>
  );
}
