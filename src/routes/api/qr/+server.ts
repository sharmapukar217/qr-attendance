import { text } from "@sveltejs/kit";
import { appRouter } from "$lib/routers";
import { t } from "$lib/utilities/t.server";

const data = {
  title: "FNCCI-Bagmati Province E-Commerce Training",
  scheduledDate: "2024-05-11",
  scheduledTime: "ALL DAY",
  scheduledLocation: "OFFICE",
  shouldSendEmail: false,
  attendees: [
    { name: "Rajesh Thing", phoneNumber: "9818875830", office: "Industry and Commerce Office Rasuwa", role: "participant" },
    { name: "Pasang Wangde Lopchan", phoneNumber: "9862498648", office: "Industry and Commerce Office Rasuwa", role: "participant" },
    { name: "Manika Lama", phoneNumber: "", office: "Industry and Commerce Office Ramechhap", role: "participant" },
    { name: "Nimfurba Sherpa", phoneNumber: "9854039008", office: "Industry and Commerce Office Ramechhap", role: "participant" },
    { name: "Sujata Shrestha", phoneNumber: "9865883599", office: "Industry and Commerce Office Ramechhap", role: "participant" },
    { name: "Pusparam Ghimire", phoneNumber: "9843515925", office: "Industry and Commerce Office Ramechhap", role: "participant" },
    { name: "Bimala Thapa", phoneNumber: "", office: "Industry and Commerce Office Sindhuli", role: "participant" },
    { name: "Gopal Shrestha", phoneNumber: "", office: "Industry and Commerce Office Sindhuli", role: "participant" },
    { name: "Nil Bahadur KC", phoneNumber: "9855054068", office: "Industry and Commerce Office Chitwan", role: "participant" },
    { name: "Surendra Karki", phoneNumber: "9855055644", office: "Industry and Commerce Office Chitwan", role: "participant" },
    { name: "Dipendra Ghale", phoneNumber: "9851182293", office: "Industry and Commerce Office Sindhupalchok", role: "participant" },
    { name: "Mahesh Dhital", phoneNumber: "9860536270", office: "Industry and Commerce Office Sindhupalchok", role: "participant" },
    { name: "Geeta Purkuti", phoneNumber: "9849172133", office: "Industry and Commerce Office Kavrepalanchok", role: "participant" },
    { name: "Rasila Chaulagain", phoneNumber: "9803962541", office: "Industry and Commerce Office Kavrepalanchok", role: "participant" },
    { name: "Sarita Sahi Thakuri", phoneNumber: "9849157900", office: "Industry and Commerce Office Lalitpur", role: "participant" },
    { name: "Sanjit Shrestha", phoneNumber: "9841463605", office: "Industry and Commerce Office Lalitpur", role: "participant" },
    { name: "Kalpana Maharjan", phoneNumber: "9845188202", office: "Industry and Commerce Office Lalitpur", role: "participant" },
    { name: "Ritika Shrestha", phoneNumber: "9844289070", office: "Industry and Commerce Office Lalitpur", role: "participant" },
    { name: "Rupa Thapa", phoneNumber: "9841483853", office: "Federation of Nepal Cottage & Small Industries Bagmati Province", role: "participant" },
    { name: "Sanchamaya Tamang", phoneNumber: "9851178508", office: "Federation of Nepal Cottage & Small Industries Bagmati Province", role: "participant" },
    { name: "Chandrawati Paneru Adhikari", phoneNumber: "9845943582", office: "Federation of Nepal Cottage & Small Industries Bagmati Province", role: "participant" },
    { name: "Radhika Chaulagain", phoneNumber: "9845107272", office: "Federation of Nepal Cottage & Small Industries Bagmati Province", role: "participant" },
    { name: "Dil Sundar Shrestha", phoneNumber: "9851020903", office: "FNCCI Bagmati Province", role: "participant" },
    { name: "Gunraj Shrestha", phoneNumber: "9855066464", office: "FNCCI Bagmati Province", role: "participant" },
    { name: "Durgaraj Shrestha", phoneNumber: "9851064611", office: "FNCCI Bagmati Province", role: "participant" },
    { name: "Kabiraj Khatri", phoneNumber: "9851197333", office: "FNCCI Bagmati Province", role: "participant" },
    { name: "Jiwan Kaji Shrestha", phoneNumber: "9851191965", office: "FNCCI Bagmati Province", role: "participant" },
    { name: "Shiva Prasad Manandhar", phoneNumber: "9851023514", office: "FNCCI Bagmati Province", role: "participant" },
    { name: "Birendranath Bhattrai", phoneNumber: "9851008949", office: "FNCCI Bagmati Province", role: "participant" },
    { name: "krishna Bhakta Shrestha", phoneNumber: "9851043099", office: "FNCCI Bagmati Province", role: "participant" },
    { name: "Rajan Karki", phoneNumber: "9841274595", office: "FNCCI Bagmati Province", role: "participant" },
    { name: "Sanat Thapa", phoneNumber: "9851077809", office: "FNCCI Bagmati Province", role: "participant" },
    { name: "Anil Krishna Shrestha", phoneNumber: "9855055021", office: "FNCCI Bagmati Province", role: "participant" },
    { name: "Premhari Mainali", phoneNumber: "9802022445", office: "FNCCI Bagmati Province", role: "participant" },
    { name: "Rudra Bahadur Khatri", phoneNumber: "9841232967", office: "FNCCI Bagmati Province", role: "participant" },
    { name: "Geeta Amatya", phoneNumber: "9851176783", office: "FNCCI Bagmati Province", role: "participant" },
    { name: "Grouben Taujale", phoneNumber: "9851075011", office: "FNCCI Bagmati Province", role: "participant" },
    { name: "Uttam Sharma Dhakal", phoneNumber: "9855067099", office: "FNCCI Bagmati Province", role: "participant" },
    { name: "Basu Narayan Shrestha", phoneNumber: "9851116743", office: "FNCCI Bagmati Province", role: "participant" },
    { name: "Rajya Laxmi Shakya", phoneNumber: "9851118266", office: "FNCCI Bagmati Province", role: "participant" },
    { name: "Roshni Maiya Dhaubanja", phoneNumber: "9841282672", office: "FNCCI Bagmati Province", role: "participant" },
    { name: "Laxmi Khanal", phoneNumber: "9841100601", office: "FNCCI Bagmati Province", role: "participant" },
    { name: "Yadav Dahal", phoneNumber: "9851110439", office: "FNCCI Bagmati Province", role: "participant" },
    { name: "Situ Sainju", phoneNumber: "9851145961", office: "FNCCI Bagmati Province", role: "participant" },
    { name: "Padam Khadka", phoneNumber: "9841453230", office: "FNCCI Bagmati Province", role: "participant" },
    { name: "Kabita Manandhar", phoneNumber: "9849783090", office: "FNCCI Bagmati Province", role: "participant" },
    { name: "Geeta Bhusal", phoneNumber: "9841443346", office: "FNCCI Bagmati Province", role: "participant" },
    { name: "Rajaram Silwal", phoneNumber: "9851121605", office: "FNCCI Bagmati Province", role: "participant" },
    { name: "Bimala Kafle", phoneNumber: "9844226910", office: "FNCCI Bagmati Province", role: "participant" },
    { name: "Geeta Thapa", phoneNumber: "9841372053", office: "FNCCI Bagmati Province", role: "participant" },
    { name: "Mahili Danuwar", phoneNumber: "9843567166", office: "FNCCI Bagmati Province", role: "participant" },
    { name: "Rajesh Bajracharya", phoneNumber: "9851184394", office: "FNCCI Bagmati Province", role: "participant" },
    { name: "Hira Bartaula", phoneNumber: "9845294239", office: "FNCCI Bagmati Province", role: "participant" },
    { name: "Saru Shrestha", phoneNumber: "9849406684", office: "FNCCI Bagmati Province", role: "participant" },
    { name: "Bibek Manandhar", phoneNumber: "9855094777", office: "FNCCI Bagmati Province", role: "participant" },
    { name: "Rajesh Thing", phoneNumber: "9818875830", office: "FNCCI Bagmati Province", role: "participant" },
    { name: "Shristee Pudasaini", phoneNumber: "9807277692", office: "FNCCI Bagmati Province", role: "participant" },
    { name: "Sushma Thapa Magar", phoneNumber: "9806815396", office: "FNCCI Bagmati Province", role: "participant" },
    { name: "Yeshodha Kumal", phoneNumber: "", office: "Makawanpur", role: "participant" },
    { name: "Siju Baniya", phoneNumber: "9864513030", office: "Thahanagar, Palung", role: "participant" },
    { name: "Riya Bista", phoneNumber: "", office: "Makawanpur", role: "participant" },
    { name: "Kamana Adhikari", phoneNumber: "9841004651", office: "Makawanpur", role: "participant" },
    { name: "Bina Bartaula", phoneNumber: "9801844917", office: "Makawanpur", role: "participant" },
    { name: "Mansingh Ghalan", phoneNumber: "9855069714", office: "Manahari, Makawanpur", role: "participant" },
    { name: "Devraj Karki", phoneNumber: "9761613413", office: "Thahanagar, Palung", role: "participant" },
    { name: "Aryaman Adhikari", phoneNumber: "", office: "Makawanpur Multiple Campus", role: "participant" },
    { name: "Ashish Shrestha", phoneNumber: "", office: "Makawanpur Multiple Campus", role: "participant" },
    { name: "Bishal Baniya", phoneNumber: "", office: "Makawanpur Multiple Campus", role: "participant" },
    { name: "Kristina Khatiwada", phoneNumber: "", office: "Makawanpur Multiple Campus", role: "participant" },
    { name: "Neha Kumari Chaudhari", phoneNumber: "", office: "Makawanpur Multiple Campus", role: "participant" },
    { name: "Prasansa Adhikari", phoneNumber: "", office: "Makawanpur Multiple Campus", role: "participant" },
    { name: "Prasant Lamichhane", phoneNumber: "", office: "Makawanpur Multiple Campus", role: "participant" },
    { name: "Samir Paudel", phoneNumber: "", office: "Makawanpur Multiple Campus", role: "participant" },
    { name: "Shikha Raya", phoneNumber: "", office: "Makawanpur Multiple Campus", role: "participant" },
    { name: "Smarika Singh", phoneNumber: "", office: "Makawanpur Multiple Campus", role: "participant" },
    { name: "Sneha Thapa", phoneNumber: "", office: "Makawanpur Multiple Campus", role: "participant" },
    { name: "Sagar Lama", phoneNumber: "", office: "Makawanpur Multiple Campus", role: "participant" },
    { name: "Shikshya Mainali", phoneNumber: "", office: "Makawanpur Multiple Campus", role: "participant" },
    { name: "Soham Chaudhari", phoneNumber: "", office: "Makawanpur Multiple Campus", role: "participant" },
    { name: "Amisha Adhikari", phoneNumber: "", office: "Makawanpur Multiple Campus", role: "participant" }

  ]
};

const caller = t.createCallerFactory(appRouter);

export const GET = async () => {
  let status = "unknown";
  try {
    await caller(() => ({})).addEvent(data);
    status = "succes";
  } catch (err) {
    console.error(err);
    status = "error";
  }

  return text(status);
};
