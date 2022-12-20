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
  const [results, setResults] = useState([]);
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
      
      إذا غادرت النوم الآن ، يجب عليك محاولة الاستيقاظ في واحدة من الأوقات التالية:`;

  const wekeUpDesc2 =
    lang === "en"
      ? `If you wake up at one of these times, you’ll rise in between 90-minute sleep cycles. A good night’s sleep consists of 5-6 complete sleep cycles.`
      : `إذا استيقظت في واحدة من هذه الأوقات ، سترتفع بين دورات النوم الـ 90 دقيقة. النوم الجيد يتكون من 5-6 دورات نوم كاملة.`;
  useEffect(() => {
    const lang = async () => {
      const lang = await AsyncStorage.getItem("lang");
      if (lang) {
        setLang(lang);
      }
    };
    lang();
    scrollRef.current?.scrollTo({
      y: ITEM_SIZE * 5,
      x: 0,
      animated: true,
    });
    scrollRefMin.current?.scrollTo({
      y: ITEM_SIZE * 30,
      x: 0,
      animated: true,
    });
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
    setResults(arr);
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
                }}
              >
                {lang === "en" ? "Notifications" : "الإشعارات"}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  LayoutAnimation.configureNext(
                    LayoutAnimation.Presets.easeInEaseOut
                  );
                  setIsModalVisibleNoti(false);
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
                }}
              >
                العربية
              </Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {lang === "en" ? <MoonIcon /> : <ArMoonIcon />}
        {!showResult ? (
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
                borderWidth: 1,
                borderColor: Colors.primary,
                paddingVertical: 10,
                borderRadius: 10,
              }}
            >
              <Animated.ScrollView
                ref={scrollRef}
                pagingEnabled
                style={{
                  width: "100%",
                  height: 114,
                  backgroundColor: Colors.mainBackground2,
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
                style={{
                  width: "100%",
                  height: 114,
                  backgroundColor: Colors.mainBackground2,
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
                  backgroundColor: Colors.mainBackground2,
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
              }}
            >
              <Text
                style={{
                  fontFamily: "TajawalMedium",
                  fontSize: 20,
                  color: Colors.darkText,
                }}
              >
                {lang === "en" ? "Calculate bedtime" : "حساب وقت النوم"}
              </Text>
            </TouchableOpacity>
            <View style={{ flex: 1, justifyContent: "center" }}>
              <Text style={styles.clockText}>
                {lang === "en"
                  ? "If you want to go to bed now..."
                  : "إذا كنت تريد الذهاب إلى النوم الآن ..."}
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: Colors.primary,
                  height: 50,
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 10,
                  marginTop: 20,
                }}
              >
                <Text
                  style={{
                    fontFamily: "TajawalMedium",
                    fontSize: 20,
                    color: Colors.darkText,
                  }}
                >
                  {lang === "en"
                    ? "Calculate wake-up time"
                    : "حساب وقت الإستيقاظ"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={{ flex: 1, justifyContent: "center" }}>
            <Text style={styles.clockText}></Text>
          </View>
        )}
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
  clockText: {
    fontFamily: "TajawalMedium",
    fontSize: 20,
    color: Colors.text,
    textAlign: "center",
  },
});

// var SCBedTime = {
//   hours: 0,
//   minutes: 0,
//   meridiem: "AM",
// };
// (function () {
//   new IosSelector({
//     el: ".time-picker__hours",
//     type: "infinite",
//     source: createArray(12, 1),
//     count: 16,
//     value: 6,
//     sensitivity: 3,
//     // onCycle: function(direction){
//     //   var pos = meridiemSelector.scroll ? 0 : 1;
//     //   meridiemSelector.select(phases[pos].value);
//     // },
//     onAnimationStart: function (selected) {
//       SCBedTime.hours = selected.value;
//     },
//     onChange: function (selected) {
//       SCBedTime.hours = selected.value;
//     },
//   });
//   new IosSelector({
//     el: ".time-picker__minutes",
//     type: "infinite",
//     source: createArray(60, 0, true),
//     count: 16,
//     value: 30,
//     sensitivity: 3,
//     // onCycle: function(direction){
//     //   var pos = hourSelector.scroll;
//     //   pos += direction == "up" ? 1 : -1;
//     //   pos %= hours.length;
//     //   if (pos < 0) {
//     //     pos = hours.length + pos;
//     //   }
//     //   hourSelector.select(hours[pos].value);
//     // },
//     onAnimationStart: function (selected) {
//       SCBedTime.minutes = selected.value;
//     },
//     onChange: function (selected) {
//       SCBedTime.minutes = selected.value;
//     },
//   });
//   new IosSelector({
//     el: ".time-picker__meridiem",
//     type: "normal",
//     source: [
//       { value: "AM", text: "AM" },
//       { value: "PM", text: "PM" },
//     ],
//     count: 16,
//     value: "AM",
//     sensitivity: 3,
//     wheelSensitivity: 0.05,
//     onChange: function (selected) {
//       SCBedTime.meridiem = selected.value;
//     },
//   });
//   function createArray(num, addValue, format) {
//     var res = [],
//       value = 0,
//       text = "";
//     addValue = addValue || 0;
//     for (var i = 0; i < num; i++) {
//       value = i + addValue;
//       text = format && value < 10 ? "0" + value : value;
//       res.push({ value: value, text: text });
//     }
//     return res;
//   }
// })();
// (function () {
//   var timeElem = document.querySelector("#timeElem"),
//     calcElem = document.querySelector("#calcElem"),
//     hiddenCls = "content-section_hidden";
//   preventCls = "content-section_prevent";
//   addEventListener("#calcBedTime", function () {
//     fill("bedtime");
//     showElem(calcElem, timeElem);
//   });
//   addEventListener("#calcWakeTime", function () {
//     fill("wakeup");
//     showElem(calcElem, timeElem);
//   });
//   addEventListener("#backButton", function () {
//     showElem(timeElem, calcElem);
//   });
//   function addEventListener(id, fn) {
//     var elem = document.querySelector(id),
//       _moved = false;
//     elem.addEventListener("touchstart", listener);
//     elem.addEventListener("click", listener);
//     function listener(event) {
//       if (event.cancelable && event.type != "touchstart") {
//         prevent(event);
//       }
//       if (event.type == "touchstart") {
//         _moved = false;
//         elem.addEventListener("touchend", listener);
//         document.addEventListener("touchmove", touchmove);
//         return;
//       }
//       if (event.type == "touchend") {
//         (_moved ? prevent : fn).bind(this)(event);
//         elem.removeEventListener("touchend", listener);
//         document.removeEventListener("touchmove", touchmove);
//       } else {
//         fn.bind(this)(event);
//       }
//     }
//     function prevent(event) {
//       event.preventDefault();
//     }
//     function touchmove() {
//       _moved = true;
//     }
//   }
//   function showElem(elem, hideElem) {
//     elem.addEventListener("transitionend", transitionEnd);
//     hideElem.classList.add(hiddenCls);
//     hideElem.classList.add(preventCls);
//     elem.classList.add(preventCls);
//     elem.classList.remove(hiddenCls);
//     function transitionEnd(event) {
//       if (event.target != elem && event.propertyName != "opacity") {
//         return;
//       }
//       elem.classList.remove(preventCls);
//       elem.removeEventListener("transitionEnd", transitionEnd);
//     }
//   }
//   function fill(type) {
//     var titleElem = document.querySelector("#titleElem"),
//       timeSpan = document.querySelector("#timeSpan"),
//       bedText = document.querySelector("#bedTextElem"),
//       wakeText = document.querySelector("#wakeTextElem"),
//       textHiddenCls = "time-view__text_hidden";
//     if (type == "bedtime") {
//       titleElem.innerHTML = titleElem.dataset.titleBed;
//       timeSpan.innerHTML = formatTime(SCBedTime);
//       bedText.classList.remove(textHiddenCls);
//       wakeText.classList.add(textHiddenCls);
//     } else {
//       titleElem.innerHTML = titleElem.dataset.titleWakeup;
//       bedText.classList.add(textHiddenCls);
//       wakeText.classList.remove(textHiddenCls);
//     }
//     fillList(type);
//   }
//   function fillList(type) {
//     var timeList = document.querySelector("#timeList"),
//       template =
//         '<li class="time-list__item{{cls}}"><span class="time-list__text">{{time}}</span></li>',
//       suggestedClass = "time-list__item_suggested",
//       curItem = "";
//     timeList.innerHTML = "";
//     for (var i = 0; i < 6; i++) {
//       curItem = template;
//       curItem = curItem.replace("{{cls}}", i < 2 ? " " + suggestedClass : "");
//       if (type == "bedtime") {
//         curItem = curItem.replace(
//           "{{time}}",
//           formatTime(SCBedTime, (6 - i) * -1.5 - 0.25)
//         );
//       } else {
//         curItem = curItem.replace(
//           "{{time}}",
//           formatTime(getTime(), (6 - i) * 1.5 + 0.25)
//         );
//       }
//       timeList.innerHTML += curItem;
//     }
//   }
//   function formatTime(time, addHours) {
//     var allMinutes = time.hours * 60 + time.minutes,
//       str = "",
//       hours = 0,
//       minutes = 0,
//       meridiem = time.meridiem;
//     allMinutes += addHours ? addHours * 60 : 0;
//     if (allMinutes < 0) {
//       allMinutes = 720 + allMinutes;
//       meridiem = meridiem == "AM" ? "PM" : "AM";
//     } else if (allMinutes > 720) {
//       allMinutes -= 720;
//       meridiem = meridiem == "AM" ? "PM" : "AM";
//     }
//     hours = parseInt(allMinutes / 60);
//     hours = !hours ? 12 : hours;
//     minutes = allMinutes % 60;
//     minutes = minutes >= 10 ? minutes : "0" + minutes;
//     str = hours + ":" + minutes + "&nbsp;" + meridiem;
//     return str;
//   }
//   function getTime() {
//     var time = new Date(),
//       hours = time.getHours(),
//       minutes = time.getMinutes(),
//       meridiem = "AM";
//     if (hours > 11) {
//       hours -= 12;
//       meridiem = "PM";
//     }
//     return {
//       hours: hours,
//       minutes: minutes,
//       meridiem: meridiem,
//     };
//   }
// })();
// //focus-visible
// (function () {
//   function applyFocusVisiblePolyfill(e) {
//     function t(e) {
//       return !!(
//         e &&
//         e !== document &&
//         "HTML" !== e.nodeName &&
//         "BODY" !== e.nodeName &&
//         "classList" in e &&
//         "contains" in e.classList
//       );
//     }
//     function n(e) {
//       var t = e.type,
//         n = e.tagName;
//       return (
//         !("INPUT" !== n || !L[t] || e.readOnly) ||
//         ("TEXTAREA" === n && !e.readOnly) ||
//         !!e.isContentEditable
//       );
//     }
//     function o(e) {
//       e.classList.contains("focus-visible") ||
//         (e.classList.add("focus-visible"),
//         "input" == e.tagName.toLowerCase() &&
//           e.parentNode.classList.add("focus-visible"),
//         "label" == e.parentNode.tagName.toLowerCase() &&
//           e.parentNode.classList.add("focus-visible"),
//         e.classList.contains("notify__close") &&
//           e.parentNode.classList.add("focus-visible"),
//         e.setAttribute("data-focus-visible-added", ""));
//     }
//     function i(e) {
//       e.hasAttribute("data-focus-visible-added") &&
//         (e.classList.remove("focus-visible"),
//         e.parentNode &&
//           (e.parentNode.classList.remove("focus-visible"),
//           e.parentNode.parentNode &&
//             e.parentNode.parentNode.classList.remove("focus-visible")),
//         e.removeAttribute("data-focus-visible-added"));
//     }
//     function s(n) {
//       n.metaKey ||
//         n.altKey ||
//         n.ctrlKey ||
//         (t(e.activeElement) && o(e.activeElement), (v = !0));
//     }
//     function d(e) {
//       v = !1;
//     }
//     function a(e) {
//       t(e.target) && (v || n(e.target)) && o(e.target);
//     }
//     function u(e) {
//       t(e.target) &&
//         (e.target.classList.contains("focus-visible") ||
//           e.target.hasAttribute("data-focus-visible-added")) &&
//         ((f = !0),
//         window.clearTimeout(E),
//         (E = window.setTimeout(function () {
//           f = !1;
//         }, 100)),
//         i(e.target));
//     }
//     function c(e) {
//       "hidden" === document.visibilityState && (f && (v = !0), r());
//     }
//     function r() {
//       document.addEventListener("mousemove", l),
//         document.addEventListener("mousedown", l),
//         document.addEventListener("mouseup", l),
//         document.addEventListener("pointermove", l),
//         document.addEventListener("pointerdown", l),
//         document.addEventListener("pointerup", l),
//         document.addEventListener("touchmove", l),
//         document.addEventListener("touchstart", l),
//         document.addEventListener("touchend", l);
//     }
//     function m() {
//       document.removeEventListener("mousemove", l),
//         document.removeEventListener("mousedown", l),
//         document.removeEventListener("mouseup", l),
//         document.removeEventListener("pointermove", l),
//         document.removeEventListener("pointerdown", l),
//         document.removeEventListener("pointerup", l),
//         document.removeEventListener("touchmove", l),
//         document.removeEventListener("touchstart", l),
//         document.removeEventListener("touchend", l);
//     }
//     function l(e) {
//       (e.target.nodeName && "html" === e.target.nodeName.toLowerCase()) ||
//         ((v = !1), m());
//     }
//     var v = !0,
//       f = !1,
//       E = null,
//       L = {
//         text: !0,
//         search: !0,
//         url: !0,
//         tel: !0,
//         email: !0,
//         password: !0,
//         number: !0,
//         date: !0,
//         month: !0,
//         week: !0,
//         time: !0,
//         datetime: !0,
//         "datetime-local": !0,
//       };
//     document.addEventListener("keydown", s, !0),
//       document.addEventListener("mousedown", d, !0),
//       document.addEventListener("pointerdown", d, !0),
//       document.addEventListener("touchstart", d, !0),
//       document.addEventListener("visibilitychange", c, !0),
//       r(),
//       e.addEventListener("focus", a, !0),
//       e.addEventListener("blur", u, !0),
//       e.nodeType === Node.DOCUMENT_FRAGMENT_NODE && e.host
//         ? e.host.setAttribute("data-js-focus-visible", "")
//         : e.nodeType === Node.DOCUMENT_NODE &&
//           (document.documentElement.classList.add("js-focus-visible"),
//           document.documentElement.setAttribute("data-js-focus-visible", ""));
//   }
//   if ("undefined" != typeof window && "undefined" != typeof document) {
//     var event;
//     window.applyFocusVisiblePolyfill = applyFocusVisiblePolyfill;
//     try {
//       event = new CustomEvent("focus-visible-polyfill-ready");
//     } catch (e) {
//       (event = document.createEvent("CustomEvent")),
//         event.initCustomEvent("focus-visible-polyfill-ready", !1, !1, {});
//     }
//     window.dispatchEvent(event);
//   }
//   "undefined" != typeof document && applyFocusVisiblePolyfill(document);
// })();
