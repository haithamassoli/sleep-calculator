import "react-native-gesture-handler";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  I18nManager,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Notifications from "expo-notifications";
import { SafeAreaView } from "react-native-safe-area-context";
import MoonIcon from "./assets/icons/moonIcon";
import Colors from "./src/colors";
import { reloadAsync } from "expo-updates";
import ArMoonIcon from "./assets/icons/arMoonIcon";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function App() {
  const [page, setPage] = useState("home");
  const [lang, setLang] = useState("en");
  const [hour, setHour] = useState(6);
  const [minute, setMinute] = useState(30);
  const [period, setPeriod] = useState("am");
  const [fontsLoaded] = useFonts({
    TajawalMedium: require("./assets/fonts/Tajawal-Medium.ttf"),
    TajawalBold: require("./assets/fonts/Tajawal-Bold.ttf"),
    Bukra: require("./assets/fonts/29ltbukra.ttf"),
    Dubai: require("./assets/fonts/dubai.ttf"),
  });

  useEffect(() => {
    const lang = async () => {
      const lang = await AsyncStorage.getItem("lang");
      if (lang) {
        setLang(lang);
      }
    };
    lang();
  }, []);

  const toggleLang = useCallback(async () => {
    if (lang === "en") {
      if (!I18nManager.isRTL) {
        try {
          I18nManager.allowRTL(true);
          I18nManager.forceRTL(true);
          await AsyncStorage.setItem("lang", "ar");
          setLang("ar");
          await reloadAsync();
        } catch (error) {
          console.log(error);
        }
      }
    } else {
      if (I18nManager.isRTL) {
        try {
          I18nManager.allowRTL(false);
          I18nManager.forceRTL(false);
          await AsyncStorage.setItem("lang", "en");
          setLang("en");
          await reloadAsync();
        } catch (error) {
          console.log(error);
        }
      }
    }
  }, [lang]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar style={"light"} backgroundColor={Colors.backgroundSec} />
      <View style={styles.container}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            width: "100%",
            paddingHorizontal: 20,
            paddingTop: 20,
          }}
        >
          <Text
            style={{
              fontFamily: "TajawalMedium",
              fontSize: 20,
              color: Colors.text,
            }}
          >
            {lang === "en" ? "Home" : "الرئيسية"}
          </Text>
          <TouchableOpacity onPress={toggleLang}>
            <Text
              style={{
                fontFamily: "TajawalMedium",
                fontSize: 20,
                color: Colors.text,
              }}
            >
              {lang === "en" ? "Notifications" : "الإشعارات"}
            </Text>
          </TouchableOpacity>
        </View>
        {lang === "en" ? <MoonIcon /> : <ArMoonIcon />}

        <View style={{ flex: 1, justifyContent: "center" }}>
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              onPress={() => {
                if (hour === 12) {
                  setHour(1);
                } else {
                  setHour(hour + 1);
                }
              }}
            >
              <Text
                style={{
                  fontFamily: "TajawalMedium",
                  fontSize: 20,
                  color: Colors.text,
                }}
              >
                +
              </Text>
            </TouchableOpacity>
            <Text
              style={{
                fontFamily: "TajawalMedium",
                fontSize: 20,
                color: Colors.text,
              }}
            >
              {hour}
            </Text>
            <TouchableOpacity
              onPress={() => {
                if (hour === 1) {
                  setHour(12);
                } else {
                  setHour(hour - 1);
                }
              }}
            >
              <Text
                style={{
                  fontFamily: "TajawalMedium",
                  fontSize: 20,
                  color: Colors.text,
                }}
              >
                -
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                if (minute === 59) {
                  setMinute(0);
                } else {
                  setMinute(minute + 1);
                }
              }}
            >
              <Text
                style={{
                  fontFamily: "TajawalMedium",
                  fontSize: 20,
                  color: Colors.text,
                }}
              >
                +
              </Text>
            </TouchableOpacity>
            <Text
              style={{
                fontFamily: "TajawalMedium",
                fontSize: 20,
                color: Colors.text,
              }}
            >
              {minute}
            </Text>
            <TouchableOpacity
              onPress={() => {
                if (minute === 0) {
                  setMinute(59);
                } else {
                  setMinute(minute - 1);
                }
              }}
            >
              <Text
                style={{
                  fontFamily: "TajawalMedium",
                  fontSize: 20,
                  color: Colors.text,
                }}
              >
                -
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                if (period === "am") {
                  setPeriod("pm");
                } else {
                  setPeriod("am");
                }
              }}
            >
              <Text
                style={{
                  fontFamily: "TajawalMedium",
                  fontSize: 20,
                  color: Colors.text,
                }}
              >
                {period}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.mainBackground,
    alignItems: "center",
    justifyContent: "center",
  },
});
