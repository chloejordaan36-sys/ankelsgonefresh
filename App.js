import { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import Voice from "@react-native-community/voice";
import * as Speech from "expo-speech";

export default function App() {

  const [position, setPosition] = useState("");
  const [workout, setWorkout] = useState("");
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [listening, setListening] = useState(false);
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [strengths, setStrengths] = useState("");
  const [weaknesses, setWeaknesses] = useState("");
  const [goal, setGoal] = useState("");
  const [dominantHand, setDominantHand] = useState("");
  const [skillLevel, setSkillLevel] = useState("");

  // 🎤 Voice setup
useEffect(() => {

  loadProfile();

  Voice.onSpeechResults = onSpeechResults;

  Voice.onSpeechError = (e) => {
    console.log("Voice error:", e);
    setListening(false);
  };

  Voice.onSpeechEnd = () => {
    setListening(false);
  };

  const loadProfile = async () => {
  try {

    const response = await fetch(
      "http://192.168.0.27:3000/profile/floors"
    );

    const data = await response.json();

    setPosition(data.position || "");
    setHeight(data.height || "");
    setWeight(data.weight || "");
    setAge(String(data.age || ""));
    setDominantHand(data.dominant_hand || "");
    setSkillLevel(data.skill_level || "");
    setStrengths(data.strengths || "");
    setWeaknesses(data.weaknesses || "");
    setGoal(data.goal || "");

  } catch (err) {
    console.log(err);
  }
};

  return () => {
    Voice.destroy().then(Voice.removeAllListeners);
  };

}, []);

    Voice.onSpeechEnd = () => {
      setListening(false);
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  };

  // 🎤 When speech is detected
  const onSpeechResults = (event) => {
    const text = event.value?.[0];
    if (text) {
      setMessage(text);
      sendVoiceMessage(text);
    }
  };

  // 🔊 AI speaks
  const speak = (text) => {
    Speech.speak(text, {
      language: "en-US",
      rate: 1
    });
  };

  const saveProfile = async () => {
  try {
    const response = await fetch(
      "http://192.168.0.27:3000/profile",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
       body: JSON.stringify({
  user: "floors",
  position,
  height,
  weight,
  age,
  dominant_hand: dominantHand,
  skill_level: skillLevel,
  strengths,
  weaknesses,
  goal,
}),
      }
    );

    const data = await response.json();

    alert(data.message || "Profile Saved");
  } catch (err) {
    console.log(err);
    alert("Failed to save profile");
  }
};

const generateWorkout = async () => {
  try {
    const response = await fetch(
      "http://192.168.0.27:3000/generate-workout",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: "floors",
        }),
      }
    );

    const data = await response.json();

    setWorkout(data.workout || "");
  } catch (err) {
    console.log(err);
  }
};

  // 🧠 TEXT MESSAGE
  const sendMessage = async () => {
    if (!message.trim()) return;
    handleAI(message);
    setMessage("");
  };

  // 🎤 VOICE MESSAGE
  const sendVoiceMessage = async (text) => {
    handleAI(text);
  };

  // 🧠 SINGLE AI HANDLER (FIXES DUPLICATION BUG)
  const handleAI = async (text) => {

    const userMessage = {
      sender: "user",
      text
    };

    setChat(prev => [...prev, userMessage]);

    try {
      const response = await fetch(
        "http://192.168.0.27:3000/ask-ai",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            user: "floors",
            message: text,
            personality: "basketball_street_coach"
          })
        }
      );

      const data = await response.json();

      const aiReply = data.reply || "No response";

      const aiMessage = {
        sender: "ai",
        text: aiReply
      };

      setChat(prev => [...prev, aiMessage]);

      speak(aiReply);

    } catch (err) {
      console.log(err);

      setChat(prev => [
        ...prev,
        {
          sender: "ai",
          text: "Server connection failed."
        }
      ]);
    }
  };

  // 🎤 HOLD TO TALK START
  const startListening = async () => {
    try {
      setListening(true);
      await Voice.start("en-US");
    } catch (e) {
      console.log("Mic error:", e);
      setListening(false);
    }
  };

  // 🎤 STOP LISTENING
  const stopListening = async () => {
    try {
      await Voice.stop();
      setListening(false);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      <Text style={styles.title}>
        ANKLES GONE AI 🏀
      </Text>

      <TouchableOpacity
  style={styles.button}
  onPress={generateWorkout}
>
  <Text style={styles.buttonText}>
    GENERATE WORKOUT
  </Text>
</TouchableOpacity>

      {/* 🎤 HOLD TO TALK BUTTON */}
      <TouchableOpacity
        onPressIn={startListening}
        onPressOut={stopListening}
        style={[
          styles.micButton,
          listening && { backgroundColor: "#7c3aed" }
        ]}
      >
        <Text style={styles.micText}>
          {listening ? "🎤 Listening..." : "🎤 Hold to Talk"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.title}>PLAYER PROFILE</Text>

<TextInput
  style={styles.input}
  placeholder="Position (PG, SG, SF...)"
  placeholderTextColor="#999"
  value={position}
  onChangeText={setPosition}
/>

<TextInput
  style={styles.input}
  placeholder="Height"
  placeholderTextColor="#999"
  value={height}
  onChangeText={setHeight}
/>

<TextInput
  style={styles.input}
  placeholder="Weight"
  placeholderTextColor="#999"
  value={weight}
  onChangeText={setWeight}
/>

<TextInput
  style={styles.input}
  placeholder="Age"
  placeholderTextColor="#999"
  value={age}
  onChangeText={setAge}
/>

<TextInput
  style={styles.input}
  placeholder="Strengths"
  placeholderTextColor="#999"
  value={strengths}
  onChangeText={setStrengths}
/>

<TextInput
  style={styles.input}
  placeholder="Weaknesses"
  placeholderTextColor="#999"
  value={weaknesses}
  onChangeText={setWeaknesses}
/>

<TextInput
  style={styles.input}
  placeholder="Goal"
  placeholderTextColor="#999"
  value={goal}
  onChangeText={setGoal}
/>

<TouchableOpacity
  style={styles.button}
  onPress={saveProfile}
>
  <Text style={styles.buttonText}>
    SAVE PROFILE
  </Text>
</TouchableOpacity>

      <ScrollView style={styles.chatBox}>

        {workout ? (
  <View
    style={{
      backgroundColor: "#111",
      padding: 15,
      marginBottom: 15,
      borderRadius: 10,
    }}
  >
    <Text style={{ color: "#fff" }}>
      {workout}
    </Text>
  </View>
) : null}

        {chat.map((msg, index) => (
          <View
            key={index}
            style={[
              styles.message,
              msg.sender === "user"
                ? styles.userMessage
                : styles.aiMessage
            ]}
          >
            <Text style={styles.messageText}>
              {msg.text}
            </Text>
          </View>
        ))}

      </ScrollView>

      <View style={styles.inputContainer}>

        <TextInput
          style={styles.input}
          placeholder="Ask Coach..."
          placeholderTextColor="#999"
          value={message}
          onChangeText={setMessage}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={sendMessage}
        >
          <Text style={styles.buttonText}>
            SEND
          </Text>
        </TouchableOpacity>

      </View>

    </SafeAreaView>
  );

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
    paddingTop: 50
  },

  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10
  },

  micButton: {
    backgroundColor: "#222",
    padding: 14,
    marginHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10
  },

  micText: {
    color: "#fff",
    fontWeight: "bold"
  },

  chatBox: {
    flex: 1,
    paddingHorizontal: 10
  },

  message: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    maxWidth: "80%"
  },

  userMessage: {
    backgroundColor: "#7c3aed",
    alignSelf: "flex-end"
  },

  aiMessage: {
    backgroundColor: "#1f1f1f",
    alignSelf: "flex-start"
  },

  messageText: {
    color: "#fff",
    fontSize: 16
  },

  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#222"
  },

  input: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    color: "#fff",
    paddingHorizontal: 15,
    borderRadius: 10
  },

  button: {
    backgroundColor: "#7c3aed",
    marginLeft: 10,
    paddingHorizontal: 20,
    justifyContent: "center",
    borderRadius: 10
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold"
  }

});