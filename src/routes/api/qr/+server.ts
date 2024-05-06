import { text } from "@sveltejs/kit";
import { appRouter } from "$lib/routers";
import { t } from "$lib/utilities/t.server";

const data = {
  title: "FNCCI-Bagmati Province E-Commerce Training",
  scheduledDate: "05-11-2024",
  scheduledTime: "ALL DAY",
  scheduledLocation: "OFFICE",
  shouldSendEmail: false,
  attendees: [
    { name: "Rishab Nepal", email: "hi_1_hyperce@gmail.com", phoneNumber: "9861352220" },
    {
      name: "Parasar Neupane",
      email: "hi_2_hyperce@gmail.com",
      phoneNumber: "9843622201"
    },
    { name: "Digyan Shakya", email: "hi_3_hyperce@gmail.com", phoneNumber: "9843519459" },
    {
      name: "Nil Bahadur KC",
      email: "hi_4_hyperce@gmail.com",
      phoneNumber: "9855054068"
    },
    { name: "Teklal Bhusal", email: "hi_5_hyperce@gmail.com", phoneNumber: "" },
    {
      name: "Abeneswor Karki",
      email: "hi_6_hyperce@gmail.com",
      phoneNumber: "9851111769"
    },
    { name: "Ganesh Karki", email: "hi_7_hyperce@gmail.com", phoneNumber: "9851050534" },
    { name: "Anita Jirel", email: "hi_8_hyperce@gmail.com", phoneNumber: "9863421009" },
    {
      name: "Sushma Shrestha",
      email: "hi_9_hyperce@gmail.com",
      phoneNumber: "9844002371"
    },
    { name: "Pawan Karki", email: "hi_10_hyperce@gmail.com", phoneNumber: "9855070110" },
    { name: "Pratima Shrestha", email: "hi_11_hyperce@gmail.com", phoneNumber: "" },
    {
      name: "Neha Bidhuchhe",
      email: "hi_12_hyperce@gmail.com",
      phoneNumber: "9841348155"
    },
    {
      name: "Sunita Laxmi Shrestha",
      email: "hi_13_hyperce@gmail.com",
      phoneNumber: "9841102652"
    },
    {
      name: "Puja Shrestha",
      email: "hi_14_hyperce@gmail.com",
      phoneNumber: "9841590490"
    },
    { name: "Nabin KC", email: "hi_15_hyperce@gmail.com", phoneNumber: "9854040199" },
    {
      name: "Keshav Prasad Ghimire",
      email: "hi_16_hyperce@gmail.com",
      phoneNumber: "9854040052"
    },
    { name: "Ratna Bahadur Newar", email: "hi_17_hyperce@gmail.com", phoneNumber: "" },
    { name: "Chukta Bahadur Magar", email: "hi_18_hyperce@gmail.com", phoneNumber: "" },
    { name: "Sarmila Shrestha", email: "hi_19_hyperce@gmail.com", phoneNumber: "" },
    { name: "Ishori Simkhada", email: "hi_20_hyperce@gmail.com", phoneNumber: "" },
    {
      name: "Ramkumar Rajbhandari",
      email: "hi_21_hyperce@gmail.com",
      phoneNumber: "9844082032"
    },
    {
      name: "Kapil Kumar Shrestha",
      email: "hi_22_hyperce@gmail.com",
      phoneNumber: "9844042952"
    },
    { name: "Mohan Das", email: "hi_23_hyperce@gmail.com", phoneNumber: "9845688672" },
    {
      name: "Pashupati Gopali",
      email: "hi_24_hyperce@gmail.com",
      phoneNumber: "9861775152"
    },
    {
      name: "Kiran Burlakoti",
      email: "hi_25_hyperce@gmail.com",
      phoneNumber: "9855062705"
    },
    {
      name: "Purna Laxmi Lohala",
      email: "hi_26_hyperce@gmail.com",
      phoneNumber: "9841877189"
    },
    {
      name: "Suresh Sapkota",
      email: "hi_27_hyperce@gmail.com",
      phoneNumber: "9866195771"
    },
    {
      name: "Niroj Kaji Shrestha",
      email: "hi_28_hyperce@gmail.com",
      phoneNumber: "9851011082"
    },
    { name: "Ishor Dangol", email: "hi_29_hyperce@gmail.com", phoneNumber: "9851185919" },
    { name: "Rajkumar Aacharya", email: "hi_30_hyperce@gmail.com", phoneNumber: "" },
    {
      name: "Sudarshan Rijal",
      email: "hi_31_hyperce@gmail.com",
      phoneNumber: "9841641419"
    },
    {
      name: "Ramchandra Shrestha",
      email: "hi_32_hyperce@gmail.com",
      phoneNumber: "9860681650"
    }
  ]
};

const caller = t.createCallerFactory(appRouter);

export const GET = async () => {
  let status = "unknown";
  // try {
  //   await caller(() => ({})).addEvent(data);
  //   status = "succes";
  // } catch (err) {
  //   console.error(err);
  //   status = "error";
  // }

  return text(status);
};
