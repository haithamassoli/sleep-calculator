import "react-native-gesture-handler";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  I18nManager,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  ScrollView,
  Modal,
  LayoutAnimation,
  Platform,
  UIManager,
  BackHandler,
  Switch,
} from "react-native";
import * as Notifications from "expo-notifications";
import { SafeAreaView } from "react-native-safe-area-context";
import MoonIcon from "./assets/icons/moonIcon";
import Colors from "./src/colors";
import { reloadAsync } from "expo-updates";
import ArMoonIcon from "./assets/icons/arMoonIcon";
import BellIcon from "./assets/icons/bell";
import WorldIcon from "./assets/icons/world";
import CloseIcon from "./assets/icons/closeIcon";
import BackIcon from "./assets/icons/back";
import BedIcon from "./assets/icons/bed";
import SunIcon from "./assets/icons/sun";

if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const Hours = [
  "",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "",
];

const Minutes = [""];
for (let i = 0; i < 60; i++) {
  Minutes.push(i.toString());
}
Minutes.push("");

const ITEM_SIZE = 38;

export default function App() {
  const [page, setPage] = useState("home");
  const [lang, setLang] = useState("ar");
  const [hour, setHour] = useState(5);
  const [minute, setMinute] = useState(30);
  const [period, setPeriod] = useState(0);
  const [date, setDate] = useState(new Date());
  const [showResult, setShowResult] = useState(false);
  const [showResult2, setShowResult2] = useState(false);
  const [results, setResults] = useState([]);
  const [alarms, setAlarms] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalVisibleNoti, setIsModalVisibleNoti] = useState(false);

  const Periods = [
    "",
    lang === "ar" ? "صباحًا" : "AM",
    lang === "ar" ? "مساءً" : "PM",
    "",
  ];
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollYMin = useRef(new Animated.Value(0)).current;
  const scrollYPer = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);
  const scrollRefMin = useRef<ScrollView>(null);
  const [fontsLoaded] = useFonts({
    TajawalMedium: require("./assets/fonts/Tajawal-Medium.ttf"),
    TajawalBold: require("./assets/fonts/Tajawal-Bold.ttf"),
    Bukra: require("./assets/fonts/29ltbukra.ttf"),
  });

  const wekeUpDesc =
    lang === "en"
      ? `The average human takes 15 minutes to fall asleep.
If you go to sleep right now, you should try to wake up at one of the following times:`
      : `يستغرق الإنسان العادي 15 دقيقة للنوم.
إذا غادرت النوم الآن،
 يجب عليك محاولة الاستيقاظ في واحدة من الأوقات التالية:`;

  const wekeUpDesc2 =
    lang === "en"
      ? `If you wake up at one of these times, you’ll rise in between 90-minute sleep cycles. A good night’s sleep consists of 5-6 complete sleep cycles.`
      : `إذا استيقظت في واحدة من هذه الأوقات ، سترتفع بين دورات النوم الـ 90 دقيقة. النوم الجيد يتكون من 5-6 دورات نوم كاملة.`;

  const wakeUpNow =
    lang === "en"
      ? `The average human takes 15 minutes to fall asleep.
To wake up refreshed at ${Hours[hour + 1]}:${Minutes[minute + 1]} ${
          period === 0 ? "AM" : "PM"
        }, you need go to sleep at one of the following times:`
      : `يستغرق الإنسان العادي 15 دقيقة للنوم.
للإستيقاظ بالنشاط في ${Hours[hour + 1]}:${Minutes[minute + 1]} ${
          period === 0 ? "صباحًا" : "مساءً"
        }،
تحتاج إلى الذهاب إلى النوم في واحدة من الأوقات التالية:`;
  const backAction = () => {
    if (page === "home") {
      BackHandler.exitApp();
    } else {
      setShowResult(false);
      setShowResult2(false);
      setIsModalVisible(false);
      setIsModalVisibleNoti(false);
    }
    return true;
  };
  useEffect(() => {
    const lang = async () => {
      const lang = await AsyncStorage.getItem("lang");
      if (lang) {
        setLang(lang);
      } else {
        setLang("ar");
        if (!I18nManager.isRTL) {
          try {
            I18nManager.allowRTL(true);
            I18nManager.forceRTL(true);
            await AsyncStorage.setItem("lang", "ar");
            await reloadAsync();
          } catch (error) {
            console.log(error);
          }
        }
      }
    };
    lang();

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  const CalculateBedTime = () => {
    const timeToSleep = `${Hours[hour + 1]}:${Minutes[minute + 1]} ${
      period === 0 ? "AM" : "PM"
    }`;
    const [hours, minutes] = timeToSleep.split(":");
    const hoursAsInt = parseInt(hours, 10);
    const minutesAsInt = parseInt(minutes.substr(0, 2), 10);
    const isPM = minutes.includes("PM");

    const arr = [];
    for (let i = 1; i < 7; i++) {
      const time = new Date(date);
      time.setHours(isPM ? hoursAsInt + 12 : hoursAsInt);
      time.setMinutes(minutesAsInt - 15);
      time.setSeconds(0);
      time.setMilliseconds(0);
      time.setMinutes(time.getMinutes() - 90 * i);
      arr.push(convertTo12Hour(time));
    }
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setResults(arr);
    setPage("result");
    setShowResult(true);
  };
  const CalculateWakeUpTime = () => {
    const arr = [];
    for (let i = 1; i < 7; i++) {
      const time = new Date();
      time.setMinutes(time.getMinutes() + 15);
      time.setSeconds(0);
      time.setMilliseconds(0);
      time.setMinutes(time.getMinutes() + 90 * i);
      arr.push(convertTo12Hour(time));
    }
    setResults(arr.reverse());
    setPage("result");
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowResult2(true);
  };

  const convertTo12Hour = (time: Date) => {
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const ampm =
      hours >= 12 && lang === "en"
        ? "PM"
        : hours >= 12 && lang === "ar"
        ? "مساءً"
        : lang === "en"
        ? "AM"
        : "صباحًا";
    const hours12 = hours % 12 || 12;
    const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
    return `${hours12}:${minutesStr} ${ampm}`;
  };
  // console.log(Hours[hour + 1]);
  // console.log(Minutes[minute + 1]);
  console.log(results);
  const toggleLang = useCallback(
    async (language: "ar" | "en") => {
      if (language === "en") {
        if (I18nManager.isRTL) {
          try {
            I18nManager.allowRTL(false);
            I18nManager.forceRTL(false);
            await AsyncStorage.setItem("lang", language);
            setLang(language);
            await reloadAsync();
          } catch (error) {
            console.log(error);
          }
        }
      } else {
        if (!I18nManager.isRTL) {
          try {
            I18nManager.allowRTL(true);
            I18nManager.forceRTL(true);
            await AsyncStorage.setItem("lang", language);
            setLang(language);
            await reloadAsync();
          } catch (error) {
            console.log(error);
          }
        }
      }
    },
    [lang]
  );

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar style={"light"} backgroundColor={Colors.mainBackground} />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
        }}
      >
        <View style={styles.container}>
          <View
            style={{
              flexDirection: "row",
              width: "100%",
              paddingHorizontal: 16,
              paddingVertical: 16,
              justifyContent: "flex-end",
            }}
          >
            <TouchableOpacity
              style={{ paddingHorizontal: 12 }}
              onPress={() => {
                LayoutAnimation.configureNext(
                  LayoutAnimation.Presets.easeInEaseOut
                );
                setPage("notification");
                setIsModalVisibleNoti(true);
              }}
            >
              <BellIcon />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                LayoutAnimation.configureNext(
                  LayoutAnimation.Presets.easeInEaseOut
                );
                setPage("language");
                setIsModalVisible(true);
              }}
            >
              <WorldIcon />
            </TouchableOpacity>
          </View>

          <Modal
            visible={isModalVisible}
            style={{
              flex: 1,
            }}
          >
            <View
              style={{
                backgroundColor: Colors.mainBackground,
                padding: 16,
                height: "100%",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: "TajawalMedium",
                    fontSize: 32,
                    color: Colors.text,
                  }}
                >
                  {lang === "en" ? "Language" : "اللغة"}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    LayoutAnimation.configureNext(
                      LayoutAnimation.Presets.easeInEaseOut
                    );
                    setPage("home");
                    setIsModalVisible(false);
                  }}
                >
                  <CloseIcon />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={{ paddingTop: 32 }}
                onPress={() => toggleLang("en")}
              >
                <Text
                  style={{
                    fontFamily: "TajawalMedium",
                    fontSize: 20,
                    color: Colors.text,
                    textAlign: "left",
                  }}
                >
                  English
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ paddingTop: 8 }}
                onPress={() => toggleLang("ar")}
              >
                <Text
                  style={{
                    fontFamily: "TajawalMedium",
                    fontSize: 20,
                    color: Colors.text,
                    textAlign: "left",
                  }}
                >
                  العربية
                </Text>
              </TouchableOpacity>
            </View>
          </Modal>
          <Modal
            visible={isModalVisibleNoti}
            style={{
              flex: 1,
            }}
          >
            <View
              style={{
                backgroundColor: Colors.mainBackground,
                padding: 16,
                height: "100%",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: "TajawalMedium",
                    fontSize: 32,
                    color: Colors.text,
                    textAlign: "left",
                  }}
                >
                  {lang === "en" ? "Notifications" : "الإشعارات"}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    LayoutAnimation.configureNext(
                      LayoutAnimation.Presets.easeInEaseOut
                    );
                    setPage("home");
                    setIsModalVisibleNoti(false);
                  }}
                >
                  <CloseIcon />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: 32,
                }}
              >
                <Switch
                  trackColor={{ false: "#767577", true: "#81b0ff" }}
                  // thumbColor={isEnabled || true ? "#f5dd4b" : "#f4f3f4"}
                  thumbColor={true ? "#f5dd4b" : "#f4f3f4"}
                  ios_backgroundColor="#3e3e3e"
                  // onValueChange={toggleSwitch}
                  value={true}
                  // value={isEnabled}
                />
                <View>
                  <Text
                    style={{
                      fontFamily: "TajawalMedium",
                      fontSize: 32,
                      color: Colors.text,
                      textAlign: "left",
                    }}
                  >
                    10:00 <Text style={{ fontSize: 16 }}>AM</Text>
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "TajawalMedium",
                        fontSize: 16,
                        color: Colors.text,
                        textAlign: "left",
                        marginRight: 8,
                      }}
                    >
                      S
                    </Text>
                    <Text
                      style={{
                        fontFamily: "TajawalMedium",
                        fontSize: 16,
                        color: Colors.text,
                        textAlign: "center",
                        marginRight: 8,
                        borderWidth: 1,
                        borderRadius: 16,
                        borderColor: Colors.text,
                        width: 32,
                        height: 32,
                        lineHeight: 32,
                      }}
                    >
                      M
                    </Text>
                    <Text
                      style={{
                        fontFamily: "TajawalMedium",
                        fontSize: 16,
                        color: Colors.text,
                        textAlign: "left",
                        marginRight: 8,
                      }}
                    >
                      T
                    </Text>
                    <Text
                      style={{
                        fontFamily: "TajawalMedium",
                        fontSize: 16,
                        color: Colors.text,
                        textAlign: "left",
                        marginRight: 8,
                      }}
                    >
                      W
                    </Text>
                    <Text
                      style={{
                        fontFamily: "TajawalMedium",
                        fontSize: 16,
                        color: Colors.text,
                        textAlign: "left",
                        marginRight: 8,
                      }}
                    >
                      T
                    </Text>
                    <Text
                      style={{
                        fontFamily: "TajawalMedium",
                        fontSize: 16,
                        color: Colors.text,
                        textAlign: "left",
                        marginRight: 8,
                      }}
                    >
                      F
                    </Text>
                    <Text
                      style={{
                        fontFamily: "TajawalMedium",
                        fontSize: 16,
                        color: Colors.text,
                        textAlign: "left",
                        marginRight: 8,
                      }}
                    >
                      S
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </Modal>
          {lang === "en" ? <MoonIcon /> : <ArMoonIcon />}
          {!showResult && !showResult2 ? (
            <View style={{ flex: 1, paddingTop: 72 }}>
              <Text
                style={[
                  styles.clockText,
                  {
                    paddingBottom: 12,
                  },
                ]}
              >
                {lang === "en"
                  ? "What time do you want to wake up?"
                  : "متى تريد الاستيقاظ؟"}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "74%",
                  height: 114,
                  borderWidth: 1,
                  borderColor: Colors.primary,
                  paddingVertical: 10,
                  borderRadius: 10,
                }}
              >
                <View
                  style={{
                    position: "absolute",
                    zIndex: 1,
                    bottom: 144 - 110,
                    width: "100%",
                    height: 40,
                    backgroundColor: "transparent",
                  }}
                />
                <Animated.ScrollView
                  ref={scrollRef}
                  onLayout={() => {
                    scrollRef.current?.scrollTo({
                      y: ITEM_SIZE * 5,
                      x: 0,
                      animated: true,
                    });
                  }}
                  pagingEnabled
                  style={{
                    width: "100%",
                    height: 114,
                    backgroundColor: Colors.mainBackground2,
                    borderRadius: 10,
                    borderStartWidth: 1,
                    borderTopWidth: 1,
                    borderBottomWidth: 1,
                    borderColor: Colors.primary,
                  }}
                  snapToAlignment="center"
                  contentContainerStyle={{ alignItems: "center" }}
                  onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    {
                      useNativeDriver: true,
                      listener: (event) => {
                        const index = Math.round(
                          event.nativeEvent.contentOffset.y / ITEM_SIZE
                        );
                        setHour(index);
                      },
                    }
                  )}
                  scrollEventThrottle={16}
                >
                  {Hours.map((hour, index) => {
                    const inputRange = [
                      -1,
                      0,
                      ITEM_SIZE * index,
                      ITEM_SIZE * index + 2,
                    ];
                    const opacityInputRange = [
                      -1,
                      0,
                      ITEM_SIZE * index,
                      ITEM_SIZE * index + 1,
                    ];
                    const scale = scrollY.interpolate({
                      inputRange,
                      outputRange: [1, 1, 1, 0],
                    });
                    const opacity = scrollY.interpolate({
                      inputRange: opacityInputRange,
                      outputRange: [1, 1, 1, 0],
                    });
                    return (
                      <Animated.View
                        key={index}
                        style={{
                          width: "100%",
                          height: ITEM_SIZE,
                          justifyContent: "center",
                          alignItems: "center",
                          opacity,
                          transform: [{ scale }],
                        }}
                      >
                        <Text style={styles.clockText}>{hour}</Text>
                      </Animated.View>
                    );
                  })}
                </Animated.ScrollView>
                <Animated.ScrollView
                  ref={scrollRefMin}
                  pagingEnabled
                  onLayout={() => {
                    scrollRefMin.current?.scrollTo({
                      y: ITEM_SIZE * 30,
                      x: 0,
                      animated: true,
                    });
                  }}
                  style={{
                    width: "100%",
                    height: 114,
                    backgroundColor: Colors.mainBackground2,
                    borderRadius: 10,
                    borderTopWidth: 1,
                    borderBottomWidth: 1,
                    borderColor: Colors.primary,
                  }}
                  snapToAlignment="center"
                  contentContainerStyle={{ alignItems: "center" }}
                  onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollYMin } } }],
                    {
                      useNativeDriver: true,
                      listener: (event) => {
                        const index = Math.round(
                          event.nativeEvent.contentOffset.y / ITEM_SIZE
                        );
                        setMinute(index);
                      },
                    }
                  )}
                  scrollEventThrottle={16}
                >
                  {Minutes.map((min, index) => {
                    const inputRange = [
                      -1,
                      0,
                      ITEM_SIZE * index,
                      ITEM_SIZE * index + 2,
                    ];
                    const opacityInputRange = [
                      -1,
                      0,
                      ITEM_SIZE * index,
                      ITEM_SIZE * index + 1,
                    ];
                    const scale = scrollYMin.interpolate({
                      inputRange,
                      outputRange: [1, 1, 1, 0],
                    });
                    const opacity = scrollYMin.interpolate({
                      inputRange: opacityInputRange,
                      outputRange: [1, 1, 1, 0],
                    });
                    return (
                      <Animated.View
                        key={index}
                        style={{
                          width: "100%",
                          height: ITEM_SIZE,
                          justifyContent: "center",
                          alignItems: "center",
                          opacity,
                          transform: [{ scale }],
                        }}
                      >
                        <Text style={styles.clockText}>
                          {min.length === 1 ? `0${min}` : min}
                        </Text>
                      </Animated.View>
                    );
                  })}
                </Animated.ScrollView>
                <Animated.ScrollView
                  pagingEnabled
                  style={{
                    width: "100%",
                    height: 114,
                    borderColor: Colors.primary,
                    backgroundColor: Colors.mainBackground2,
                    borderRadius: 10,
                    borderTopWidth: 1,
                    borderBottomWidth: 1,
                  }}
                  snapToAlignment="center"
                  contentContainerStyle={{ alignItems: "center" }}
                  onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollYPer } } }],
                    {
                      useNativeDriver: true,
                      listener: (event) => {
                        const index = Math.round(
                          event.nativeEvent.contentOffset.y / ITEM_SIZE
                        );
                        setPeriod(index);
                      },
                    }
                  )}
                  scrollEventThrottle={16}
                >
                  {Periods.map((period, index) => {
                    const inputRange = [
                      -1,
                      0,
                      ITEM_SIZE * index,
                      ITEM_SIZE * index + 2,
                    ];
                    const opacityInputRange = [
                      -1,
                      0,
                      ITEM_SIZE * index,
                      ITEM_SIZE * index + 1,
                    ];
                    const scale = scrollYPer.interpolate({
                      inputRange,
                      outputRange: [1, 1, 1, 0],
                    });
                    const opacity = scrollYPer.interpolate({
                      inputRange: opacityInputRange,
                      outputRange: [1, 1, 1, 0],
                    });
                    return (
                      <Animated.View
                        key={index}
                        style={{
                          width: "100%",
                          height: ITEM_SIZE,
                          justifyContent: "center",
                          alignItems: "center",
                          opacity,
                          transform: [{ scale }],
                        }}
                      >
                        <Text style={styles.clockText}>{period}</Text>
                      </Animated.View>
                    );
                  })}
                </Animated.ScrollView>
              </View>
              <TouchableOpacity
                onPress={CalculateBedTime}
                style={{
                  backgroundColor: Colors.primary,
                  height: 50,
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 10,
                  marginTop: 20,
                  flexDirection: "row",
                }}
              >
                <Text
                  style={{
                    fontFamily: "TajawalMedium",
                    fontSize: 20,
                    color: Colors.darkText,
                    marginRight: 10,
                  }}
                >
                  {lang === "en" ? "Calculate bedtime" : "حساب وقت النوم"}
                </Text>
                <BedIcon />
              </TouchableOpacity>
              <View style={{ flex: 1, justifyContent: "center" }}>
                <Text style={styles.clockText}>
                  {lang === "en"
                    ? "If you want to go to bed now..."
                    : "إذا كنت تريد الذهاب إلى النوم الآن ..."}
                </Text>
                <TouchableOpacity
                  onPress={CalculateWakeUpTime}
                  style={{
                    backgroundColor: Colors.primary,
                    height: 50,
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: 10,
                    marginTop: 20,
                    flexDirection: "row",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "TajawalMedium",
                      fontSize: 20,
                      color: Colors.darkText,
                      marginRight: 10,
                    }}
                  >
                    {lang === "en"
                      ? "Calculate wake-up time"
                      : "حساب وقت الإستيقاظ"}
                  </Text>
                  <SunIcon />
                </TouchableOpacity>
              </View>
            </View>
          ) : showResult ? (
            <>
              <Text
                style={[
                  styles.clockText,
                  {
                    // textAlign: "left",
                    lineHeight: 34,
                    marginHorizontal: 20,
                    marginTop: 28,
                    marginBottom: 10,
                  },
                ]}
              >
                {wakeUpNow}
              </Text>
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  flexDirection: "row",
                  flexWrap: "wrap",
                }}
              >
                {results.map((result, index) => (
                  <View
                    key={index}
                    style={{
                      backgroundColor: Colors.lightBackground,
                      height: 50,
                      justifyContent: "center",
                      alignItems: "center",
                      width: index === 0 || index === 1 ? "92%" : "44%",
                      borderRadius: 10,
                      marginTop: 20,
                      marginHorizontal: 10,
                      paddingHorizontal: 20,
                      paddingVertical: 10,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "TajawalMedium",
                        fontSize: 20,
                        color: Colors.text,
                      }}
                    >
                      {result}{" "}
                      {(index === 0 || index === 1) && (
                        <Text style={{ fontSize: 15, color: Colors.primary2 }}>
                          {lang === "en" ? "SUGGESTED" : "مقترح"}
                        </Text>
                      )}
                    </Text>
                  </View>
                ))}
              </View>
              <Text
                style={[
                  styles.clockText,
                  {
                    // textAlign: "left",
                    lineHeight: 34,
                    marginHorizontal: 20,
                    marginTop: 28,
                    marginBottom: 10,
                  },
                ]}
              >
                {wekeUpDesc2}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  LayoutAnimation.configureNext(
                    LayoutAnimation.Presets.easeInEaseOut
                  );
                  setResults([]);
                  setPage("home");
                  setShowResult(false);
                }}
                style={{
                  backgroundColor: Colors.primary,
                  height: 50,
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 10,
                  marginVertical: 22,
                  flexDirection: "row",
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                }}
              >
                <Text
                  style={{
                    fontFamily: "TajawalMedium",
                    fontSize: 20,
                    color: Colors.darkText,
                  }}
                >
                  {lang === "en" ? "Calculate again" : "حساب مرة أخرى"}
                </Text>
                <BackIcon flip={lang === "en"} />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text
                style={[
                  styles.clockText,
                  {
                    // textAlign: "left",
                    lineHeight: 34,
                    marginHorizontal: 20,
                    marginTop: 28,
                    marginBottom: 10,
                  },
                ]}
              >
                {wekeUpDesc}
              </Text>
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  flexDirection: "row",
                  flexWrap: "wrap",
                }}
              >
                {results.map((result, index) => (
                  <View
                    key={index}
                    style={{
                      backgroundColor: Colors.lightBackground,
                      height: 50,
                      justifyContent: "center",
                      alignItems: "center",
                      width: index === 0 || index === 1 ? "92%" : "44%",
                      borderRadius: 10,
                      marginTop: 20,
                      marginHorizontal: 10,
                      paddingHorizontal: 20,
                      paddingVertical: 10,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "TajawalMedium",
                        fontSize: 20,
                        color: Colors.text,
                      }}
                    >
                      {result}{" "}
                      {(index === 0 || index === 1) && (
                        <Text style={{ fontSize: 15, color: Colors.primary2 }}>
                          {lang === "en" ? "SUGGESTED" : "مقترح"}
                        </Text>
                      )}
                    </Text>
                  </View>
                ))}
              </View>
              <Text
                style={[
                  styles.clockText,
                  {
                    // textAlign: "left",
                    lineHeight: 34,
                    marginHorizontal: 20,
                    marginTop: 28,
                    marginBottom: 10,
                  },
                ]}
              >
                {wekeUpDesc2}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  LayoutAnimation.configureNext(
                    LayoutAnimation.Presets.easeInEaseOut
                  );
                  setResults([]);
                  setPage("home");
                  setShowResult2(false);
                }}
                style={{
                  backgroundColor: Colors.primary,
                  height: 50,
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 10,
                  marginVertical: 22,
                  flexDirection: "row",
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                }}
              >
                {/* {lang === "en" && <BackIcon />} */}
                <Text
                  style={{
                    fontFamily: "TajawalMedium",
                    fontSize: 20,
                    color: Colors.darkText,
                  }}
                >
                  {lang === "en" ? "Calculate again" : "حساب مرة أخرى"}
                </Text>
                <BackIcon flip={lang === "en"} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
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
  clockText: {
    fontFamily: "TajawalMedium",
    fontSize: 20,
    color: Colors.text,
    textAlign: "center",
  },
});
