import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

export default function HomeScreen() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "🏀 Welcome to ANKLES GONE AI. What are we working on today?"
    }
  ]);

  const askAI = async () => {
    if (!message.trim()) return;

    const userMessage = {
      sender: "user",
      text: message
    };

    setMessages(prev => [...prev, userMessage]);

    const currentMessage = message;
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch(
        "http://192.168.0.27:3000/ask-ai",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            user: "floors",
            message: currentMessage
          })
        }
      );

      const data = await res.json();

      setMessages(prev => [
        ...prev,
        {
          sender: "ai",
          text: data.reply
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: "ai",
          text: "❌ Cannot connect to server."
        }
      ]);
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        ANKLES GONE AI
      </Text>

      <FlatList
        data={messages}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View
            style={
              item.sender === "user"
                ? styles.userBubble
                : styles.aiBubble
            }
          >
            <Text style={styles.messageText}>
              {item.text}
            </Text>
          </View>
        )}
      />

      {loading && (
        <ActivityIndicator
          size="large"
          color="#00ff88"
        />
      )}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Ask Coach..."
          placeholderTextColor="#999"
          value={message}
          onChangeText={setMessage}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={askAI}
        >
          <Text style={styles.buttonText}>
            SEND
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d0d0d",
    paddingTop: 60,
    paddingHorizontal: 15
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#00ff88",
    textAlign: "center",
    marginBottom: 20
  },

  aiBubble: {
    backgroundColor: "#1a1a1a",
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    alignSelf: "flex-start",
    maxWidth: "85%"
  },

  userBubble: {
    backgroundColor: "#00ff88",
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    alignSelf: "flex-end",
    maxWidth: "85%"
  },

  messageText: {
    color: "#fff",
    fontSize: 16
  },

  inputRow: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 10
  },

  input: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    color: "#fff",
    padding: 15,
    borderRadius: 12
  },

  button: {
    backgroundColor: "#00ff88",
    justifyContent: "center",
    paddingHorizontal: 20,
    borderRadius: 12
  },

  buttonText: {
    fontWeight: "bold",
    color: "#000"
  }
});