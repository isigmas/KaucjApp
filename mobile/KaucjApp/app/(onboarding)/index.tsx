import { Pressable, StyleSheet, Text, View } from "react-native";

export default function OnboardingScreen() {
  const handleFinish = () => {
    //TODO: navigate to main app
    // TODO: set onboarding completed in  storage ;
  };
  return (
    <View style={styles.container}>
      <Text>Welcome to the App!</Text>

      <Pressable onPress={handleFinish} style={styles.button}>
        <Text style={styles.buttonText}>Get Started</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  button: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "blue",
    borderRadius: 8,
  },
  buttonText: { color: "white", fontWeight: "bold" },
});
