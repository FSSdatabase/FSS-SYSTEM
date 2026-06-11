/**
 * SEED SCRIPT — run setupSheets() ONCE from the Apps Script editor
 * to create all sheet tabs with headers and seed real student/staff data.
 *
 * After running once, this is safe to leave in the project —
 * re-running will NOT duplicate data (it checks if sheets are empty first).
 */

function setupSheets() {
  setupStudentsSheet();
  setupStaffSheet();
  setupSettingsSheet();
  setupAttendanceSheet();
  setupDAARSheet();
  setupFeesSheet();
  setupScoresSheet();
  Logger.log("✅ All sheets created and seeded successfully.");
}

// ── STUDENTS ─────────────────────────────────────────────────────────────────
function setupStudentsSheet() {
  const sh = sheetByName("Students");
  if (sh.getLastRow() > 0) { Logger.log("Students sheet already has data — skipping seed."); return; }

  sh.appendRow(["admNo","name","gender","conv","isl","status","year"]);

  const data = [
    ["FS/19/008","Fadimatu Salis Yunus","F","SS1","Mutawassid 1","Active",2019],
      ["FS/19/009","Atika Ahmad Muhammad","F","SS1","Mutawassid 1","Active",2019],
      ["FS/25/003","Aisha Aliyu Dachia","F","SS1","Mutawassid 1","Active",2025],
      ["FS/19/006","Shahida Muhammad Sani","F","SS1","Mutawassid 1","Active",2019],
      ["FS/19/005","Husna Rabiu Dodo","F","SS1","Mutawassid 1","Active",2019],
      ["FS/19/004","Hafsat Abubakar","F","SS1","Mutawassid 1","Active",2019],
      ["FS/26/291","Abdulazeez Muhammad","M","SS1","Mutawassid 1","Active",2026],
      ["FS/19/007","Zainab Ibrahim Umar","F","","Mutawassid 1","Active",2019],
      ["FS/25/297","Abdulrahman Harun","M","","Mutawassid 1","Active",2025],
      ["FS/25/298","Abdullahi Ibrahim Umar","M","","Mutawassid 1","Active",2025],
      ["FS/25/299","Ibrahim Muhammad Umar","M","","Mutawassid 1","Active",2025],
      ["FS/25/300","Asiya Muhammad Bashir","F","","Mutawassid 1","Active",2025],
      ["FS/25/301","Muhammad Muhammad","M","","Mutawassid 1","Active",2025],
      ["FS/19/011","Asmau Ahmad","F","JSS3","","Active",2019],
      ["FS/19/002","Asmau Aliyu","F","JSS3","Mutawassid 1","Active",2019],
      ["FS/19/003","Maryam Aliyu","F","JSS3","Mutawassid 1","Active",2019],
      ["FS/19/012","Khadija Sa'eed","F","JSS3","","Active",2019],
      ["FS/19/012X","Sadiq Isa Shehu","M","JSS3","Pri 5 Islamiyyah","Active",2019],
      ["FS/19/013","Fatima Yahuza Idris","F","JSS3","","Active",2019],
      ["FS/19/014","Suhailat Usman","F","JSS3","","Active",2019],
      ["FS/19/015","Firdausi Aminu Bello","F","JSS3","","Active",2019],
      ["FS/25/030","Muhammad Auwal Tijjani","M","JSS2","Pri 4 Islamiyyah","Active",2025],
      ["FS/19/016","Abdullahi Mustapha","M","JSS2","","Active",2019],
      ["FS/21/040","Bilkisu Umar","F","JSS2","Pri 4 Islamiyyah","Active",2021],
      ["FS/19/010","Yusuf Bashir Aliyu","M","JSS2","","Active",2019],
      ["FS/19/001","Ahmad Abubakar","M","JSS2","Mutawassid 1","Active",2019],
      ["FS/19/017","Aisha Muhammad Sani","F","JSS2","","Active",2019],
      ["FS/20/015","Jafar Sani Ladan","M","JSS2","","Active",2020],
      ["FS/19/018","Hanif Muhammad","M","JSS2","Pri 2 Islamiyyah","Active",2019],
      ["FS/20/013","Abubakar Abubakar","M","JSS2","Pri 4 Islamiyyah","Active",2020],
      ["FS/26/262","Jibril Mukhtar","M","JSS2","Pri 4 Islamiyyah","Active",2026],
      ["FS/20/21","Habiba Usman","F","JSS1","Pri 5 Islamiyyah","Active",2021],
      ["FS/26/263","Musab Ibrahim Umar","M","JSS1","","Active",2026],
      ["FS/26/264","Bilkisu Murtala","F","JSS1","","Active",2026],
      ["FS/26/265","Amina Fadlullahi Ahmad","F","JSS1","","Active",2026],
      ["FS/26/292","Amina Sulaiman","F","JSS1","","Active",2026],
      ["FS/20/20","Muhammad Aliyu","M","JSS1","Pri 5 Islamiyyah","Active",2020],
      ["FS/19/019","Muhammad Adam Abdullahi","M","P5","","Active",2019],
      ["FS/22/06","Aliyu Aminu","M","P5","","Active",2022],
      ["FS/21/044","Amatullahi Nasir","F","P5","Pri 5 Islamiyyah","Active",2021],
      ["FS/21/036","Abdallah Nasir","M","P5","Pri 4 Islamiyyah","Active",2021],
      ["FS/22/061A","Jamilatu Salis Yunus","F","P5","Pri 3 Islamiyyah","Active",2022],
      ["FS/21/041","Fatima Rabiu Dodo","F","P5","Pri 5 Islamiyyah","Active",2021],
      ["FS/22/062","Fatima Shafiu Maude","F","P5","Pri 4 Islamiyyah","Active",2022],
      ["FS/22/064","Khadija Ahmad","F","P5","Pri 3 Islamiyyah","Active",2022],
      ["FS/20/018","Muhammad Mudassir Harun","M","P5","Pri 5 Islamiyyah","Active",2020],
      ["FS/19/020","Zubairu Sulaiman","M","P5","","Active",2020],
      ["FS/22/052","Abdulrahman Muhammad Rabiu","M","P5","Pri 3 Islamiyyah","Active",2022],
      ["FS/22/058","Shuraim Muhd Kabir","M","P5","Pri 2 Islamiyyah","Active",2022],
      ["FS/24/101","Faiza Faruk","F","P5","Pri 3 Islamiyyah","Active",2024],
      ["FS/26/266","Halima Mukhtar Inuwa","F","P5","Pri 2 Islamiyyah","Active",2026],
      ["FS/24/113","Yunus Mu'az","M","P4","Pri 2 Islamiyyah","Active",2024],
      ["FS/22/055","Umar Faruq Umar","M","P4","Pri 2 Islamiyyah","Active",2022],
      ["FS/21/032","Abdurrahman Haidar","M","P4","Pri 2 Islamiyyah","Active",2021],
      ["FS/22/065","Kurthum Tijjani","F","P4","Pri 2 Islamiyyah","Active",2022],
      ["FS/22/069","Habiba Mustapha Makinta","F","P4","Pri 2 Islamiyyah","Active",2022],
      ["FS/20/019","A/Rahman Fadlullahi Ahmad","M","P4","Pri 2 Islamiyyah","Active",2020],
      ["FS/22/067","Hauwau Mustapha Makinta","F","P4","Pri 2 Islamiyyah","Active",2022],
      ["FS/26/269","Isah Abubakar","M","P4","Pri 2 Islamiyyah","Active",2026],
      ["FS/23/082","Halima Mubarak","F","P4","Pri 2 Islamiyyah","Active",2023],
      ["FS/21/234","Salman Aliyu","M","P4","Pri 2 Islamiyyah","Active",2021],
      ["FS/26/270","Nuhu Musa","M","P4","Pri 2 Islamiyyah","Active",2026],
      ["FS/26/056","Umar Faruk Ismail","M","P4","Pri 2 Islamiyyah","Active",2026],
      ["FS/22/068","Halima Mansur","F","P4","Pri 2 Islamiyyah","Active",2022],
      ["FS/21/033","Abubakar Harun","M","P4","Pri 2 Islamiyyah","Active",2021],
      ["FS/22/061B","Abdurrahman Hussaini","M","P4","Pri 2 Islamiyyah","Active",2022],
      ["FS/23/073","Ahmad M. Adam","M","P4","Pri 2 Islamiyyah","Active",2023],
      ["FS/21/031","Mus'ab Usman","M","P4","Pri 2 Islamiyyah","Active",2021],
      ["FS/26/271","Asmau Mukhtar","F","P4","Pri 2 Islamiyyah","Active",2026],
      ["FS/26/267","Hauwau Abubakar","F","P4","Pri 2 Islamiyyah","Active",2026],
      ["FS/26/268","Ahmad Musa Ahmad","M","P4","Pri 2 Islamiyyah","Active",2026],
      ["FS/23/091","Salim Aliyu Dachia","M","P4","Pri 2 Islamiyyah","Active",2023],
      ["FS/26/294","Abdurrahman Usman","M","P4","Pri 2 Islamiyyah","Active",2026],
      ["FS/26/295","Ibrahim Usman","M","P4","Pri 2 Islamiyyah","Active",2026],
      ["FS/26/272","Jafar Rabiu","M","P3","","Active",2026],
      ["FS/21/042","Asmau Abubakar","F","P3","","Active",2021],
      ["FS/22/066","Sumayya Ibrahim","F","P3","","Active",2022],
      ["FS/23/093","Safiyyah Abubakar Gandu","F","P3","","Active",2023],
      ["FS/24/112","Sulaiman Muhammad","M","P3","","Active",2024],
      ["FS/24/111","Sa'adatu Nasir","F","P3","","Active",2024],
      ["FS/26/275","Zainab Musa","F","P3","","Inactive",2026],
      ["FS/23/075","Jafar Usman","M","P3","","Active",2023],
      ["FS/24/097","Abubakar Muhammad","M","P3","","Active",2024],
      ["FS/24/114","Zakiyya Nura Isa","F","P3","","Active",2024],
      ["FS/25/128","Fatima Abubakar Gadzama","F","P3","","Active",2025],
      ["FS/24/094","Abdulhamid Abubakar Gadzama","M","P3","","Active",2024],
      ["FS/25/144","Abdullahi Hussaini","M","P3","","Active",2025],
      ["FS/24/116","Nuhu Mu'az","M","P3","","Active",2024],
      ["FS/23/088","Zulaiha Muhammad Kabir","F","P3","","Active",2023],
      ["FS/23/092","Amra Aliyu Alhassan","F","P3","","Active",2023],
      ["FS/26/273","Zainab Muhammad Idris","F","P3","","Active",2026],
      ["FS/26/274","Aisha Abubakar","F","P3","","Active",2026],
      ["FS/25/141","Ismail Bashir","M","P2","","Active",2025],
      ["FS/25/143","Umar Aminu","M","P2","","Active",2025],
      ["FS/23/072","Abdullahi Saddam","M","P2","","Active",2023],
      ["FS/24/098","Adam Usman","M","P2","","Active",2024],
      ["FS/25/142","Nana Asmau Shuaibu","F","P2","","Active",2025],
      ["FS/23/083","Hajara Adam","F","P2","","Active",2023],
      ["FS/23/086","UmmuSalma Ahmad","F","P2","","Active",2023],
      ["FS/23/078","Aisha M. Salis","F","P2","","Active",2023],
      ["FS/24/108","Jamila Yusuf","F","P2","","Active",2024],
      ["FS/25/137","Aisha Mubarak","F","P2","","Active",2025],
      ["FS/24/102","Fatima Ibrahim","F","P2","","Active",2024],
      ["FS/25/127","Saifullahi Hussaini","M","P2","","Active",2025],
      ["FS/25/163","Khadija Muhammad Magaji","F","P2","","Active",2025],
      ["FS/24/103","Halima Mustapha Makinta","F","P2","","Active",2024],
      ["FS/26/276","Abdullahi M. Kabir","M","P2","","Active",2026],
      ["FS/26/277","Rahmah Muktar","F","P2","","Active",2026],
      ["FS/26/278","Hafsat Abdulkareem","F","P2","","Active",2026],
      ["FS/26/279","Abduljabbar Nasir","M","P2","","Active",2026],
      ["FS/25/156","Fadlullah Muhammad","M","P1","","Active",2025],
      ["FS/25/167","Ummulkhairi Alhassan","F","P1","","Active",2025],
      ["FS/24/096","Abdurrahman Tahir","M","P1","","Active",2024],
      ["FS/25/120","Dalhat Usman","M","P1","","Active",2025],
      ["FS/25/124","Umar Yusuf","M","P1","","Active",2025],
      ["FS/23/074","Hayatuddin Usman","M","P1","Pri 1A Islamiyyah","Active",2023],
      ["FS/25/123","Sadiq Muh'd Kabir","M","P1","","Active",2025],
      ["FS/25/126","Sadiq Abubakar Muhammad","M","P1","","Active",2025],
      ["FS/25/122","Badamasi Muh'd Muktar","M","P1","","Active",2025],
      ["FS/25/121","Umar Faruq Aliyu","M","P1","","Active",2025],
      ["FS/24/106","Hauwa Umar","F","P1","","Active",2024],
      ["FS/23/133","Khadija Shamsuddin","F","P1","","Active",2023],
      ["FS/25/165","Maimuna Usman","F","P1","","Active",2025],
      ["FS/24/099","Amaturrahman Haidar","F","P1","","Active",2024],
      ["FS/25/139","Amina Musa","F","P1","","Active",2025],
      ["FS/25/131","Amina Nura Isah","F","P1","","Active",2025],
      ["FS/26/280","Maryam Rabiu","F","P1","","Active",2026],
      ["FS/25/166","Fatima Alhassan","F","P1","","Active",2025],
      ["FS/25/119","Usman Abubakar Gadzama","M","P1","","Active",2025],
      ["FS/26/281","Ibrahim S. Bello","M","P1","","Active",2026],
      ["FS/25/192","Sulaiman Adam","M","P1","","Active",2025],
      ["FS/25/149","Idris Aliyu Dachia","M","P1","","Active",2025],
      ["FS/26/282","Fatima Muhamad Tijjani","F","P1","","Active",2026],
      ["FS/26/283","Safiyya Sagir","F","P1","","Active",2026],
      ["FS/26/284","Khadija Nasir","F","P1","","Active",2026],
      ["FS/26/285","Nana Firdausi Nasir","F","P1","","Active",2026],
      ["FS/26/293","Muhammad Muhammad","M","P1","","Active",2026],
      ["FS/26/296","Khadija Usman","F","P1","","Active",2026],
      ["FS/25/164","Ahmad Abubakar Sadiq","M","N3","","Active",2025],
      ["FS/25/154","Muhammad S Maude","M","N3","","Active",2025],
      ["FS/25/150","Sulaiman Nazir","M","N3","","Active",2025],
      ["FS/25/118","Aliyu Abubakar","M","N3","","Active",2025],
      ["FS/25/151","Shuaibu Ahmad","M","N3","","Active",2025],
      ["FS/25/147","Abdullahi Yusuf","M","N3","","Active",2025],
      ["FS/25/180","Abu-Sufyan Muhammad","M","N3","","Active",2025],
      ["FS/25/159","Rukayya Muhammad","F","N3","","Active",2025],
      ["FS/25/161","Hajara Anas","F","N3","","Active",2025],
      ["FS/25/160","Huraira Nazir","F","N3","","Active",2025],
      ["FS/25/132","Fatima Usman","F","N3","","Active",2025],
      ["FS/25/158","Fatima Umar Shugaba","F","N3","","Active",2025],
      ["FS/25/193","Hafsat Alhassan","F","N3","","Active",2025],
      ["FS/25/171","Ummukhursum Mubarak","F","N3","","Active",2025],
      ["FS/25/191","Maimuna Aliyu Turaki","F","N3","","Active",2025],
      ["FS/25/157","Zainab Bashir","F","N3","","Active",2025],
      ["FS/25/182","Mahir Muhammad Tanimu","M","N3","","Active",2025],
      ["FS/25/183","Usman Abdullahi","M","N3","","Inactive",2025],
      ["FS/25/173","Aisha Muhammad Sani","F","N3","","Active",2025],
      ["FS/25/188","Rahma Faruq","F","N3","","Active",2025],
      ["FS/25/186","Khadija Aliyu Dacia","F","N3","","Active",2025],
      ["FS/25/189","Abubakar Mansur","M","N3","","Active",2025],
      ["FS/25/179","Aliyu Muazu","M","N3","","Active",2025],
      ["FS/25/155","Hussaini Abubakar Gadzama","F","N3","","Active",2025],
      ["FS/25/178","Muhammad Abubakar Gadzama","M","N3","","Active",2025],
      ["FS/26/286","Nana Khadija Muhammad Kabir","F","N3","","Active",2026],
      ["FS/25/081","Nuhu Hussaini","M","N2","","Active",2025],
      ["FS/25/196","Ibrahim Ibrahim","M","N2","","Active",2025],
      ["FS/25/185","Abubakar Abubakar","M","N2","","Active",2025],
      ["FS/25/201","Muhammad S. Alhassan","M","N2","","Active",2025],
      ["FS/26/287","Sadiq Rabiu Dodo","M","N2","","Active",2026],
      ["FS/25/170","Fatima Suleiman","F","N2","","Active",2025],
      ["FS/25/184","Khadija Muhammad Uja","F","N2","","Active",2025],
      ["FS/25/208","Fatima Nura Commander","F","N2","","Active",2025],
      ["FS/25/213","Fatima Yusuf","F","N2","Raudah 1B","Active",2025],
      ["FS/25/215","Suhailat Yahuza M.K","F","N2","","Active",2025],
      ["FS/25/174","Maryam Muhammad","F","N2","","Active",2025],
      ["FS/25/207","Amina Muhammad","F","N2","","Active",2025],
      ["FS/25/176","Amina Yakubu Madaki","F","N2","","Active",2025],
      ["FS/25/210","Halima Shamsuddeen","F","N2","","Active",2025],
      ["FS/25/209","Aisha Umar","F","N2","","Active",2025],
      ["FS/25/169","Khadija Aliyu","F","N2","","Active",2025],
      ["FS/26/288","Hauwa'u Hassan","F","N2","","Active",2026],
      ["FS/26/289","Amina M. Kabeer","F","N2","","Active",2026],
      ["FS/26/290","Abdulazeez Muktar","M","N2","","Active",2026],
      ["FS/26/230","Saeed Muhammad","M","N1","","Active",2026],
      ["FS/26/231","Abubakar S. Tijjani","M","N1","","Active",2026],
      ["FS/26/232","Abdulkadir Mustapha","M","N1","","Active",2026],
      ["FS/26/233","Muhammad Ayman Aliyu","M","N1","","Active",2026],
      ["FS/26/234","Haruna Umar","M","N1","","Active",2026],
      ["FS/26/235","Mustapha Muhammad Kabir","M","N1","","Active",2026],
      ["FS/26/236","Ahmad Abdallah","M","N1","","Active",2026],
      ["FS/26/237","Ahmad Bn Usman","M","N1","","Active",2026],
      ["FS/26/238","Muhammad Sagir","M","N1","","Active",2026],
      ["FS/26/239","Nuruddeen Usman Arewa","M","N1","","Active",2026],
      ["FS/26/240","Shahid Muhammad Sani","M","N1","","Active",2026],
      ["FS/26/241","Muhammad Mubeen Sabitu","M","N1","","Active",2026],
      ["FS/26/242","Khadija Mustapha","F","N1","","Active",2026],
      ["FS/26/243","Khadija Abdurrahman","F","N1","","Active",2026],
      ["FS/26/244","Fatima Mustapha Makinta","F","N1","","Active",2026],
      ["FS/26/245","Maryam Anas","F","N1","","Active",2026],
      ["FS/26/246","Amira Alhassan","F","N1","","Active",2026],
      ["FS/26/247","Fatima Abubakar","F","N1","","Active",2026],
      ["FS/26/248","Asmau Umar Shugaba","F","N1","","Active",2026],
      ["FS/26/249","Amina Usman Muhammad","F","N1","","Active",2026],
      ["FS/26/250","Hussaina Saeed","F","N1","","Active",2026],
      ["FS/26/251","Zulaihat Usman","F","N1","","Active",2026],
      ["FS/26/252","Amina Mu'azu Badawi","F","N1","","Active",2026],
      ["FS/26/253","Aisha Shamsuddeen Gwarzo","F","N1","","Active",2026],
      ["FS/26/254","Safarau Nasir","F","N1","","Active",2026],
      ["FS/26/255","Halima Sufyan Abubakar","F","N1","","Active",2026],
      ["FS/26/256","Nana Aisha Shuaib","F","N1","","Active",2026],
      ["FS/26/257","Maryam Sabitu","F","N1","","Active",2026],
      ["FS/26/258","Khadija Aliyu Turaki","F","N1","","Active",2026],
      ["FS/26/259","Ummukulthum Ismail","F","N1","","Active",2026],
      ["FS/26/260","Hafsat Abubakar Gandu","F","N1","","Active",2026],
      ["FS/26/261","Jamila Adam","F","N1","","Active",2026],
      ["FS/20/011","Abdul-Rahman Nurudden","M","","Pri 4 Islamiyyah","Active",2020],
      ["FS/20/014","Muhammad Ibrahim Umar","M","","Pri 4 Islamiyyah","Active",2020],
      ["FS/20/023","Aisha Tahir","F","","Pri 4 Islamiyyah","Active",2020],
      ["FS/20/025","Husna Abubakar","F","","Pri 4 Islamiyyah","Active",2020],
      ["FS/20/027","Fatima Ibrahim Makama","F","","Pri 4 Islamiyyah","Active",2020],
      ["FS/20/028","Hassana Ibrahim Makama","F","","Pri 4 Islamiyyah","Active",2020],
      ["FS/20/029","Hussaina Ibrahim Makama","F","","Pri 4 Islamiyyah","Active",2020],
      ["FS/21/035","Muhammad Nuruddeen","M","","Pri 3 Islamiyyah","Active",2021],
      ["FS/21/037","Ruqayya Idris","F","","Pri 3 Islamiyyah","Active",2021],
      ["FS/21/038","Habiba Tahir","F","","Pri 3 Islamiyyah","Active",2021],
      ["FS/21/043","Amina Harun","F","","Pri 3 Islamiyyah","Active",2021],
      ["FS/21/045","Shafa'atu Al'amin","F","","Pri 3 Islamiyyah","Active",2021],
      ["FS/22/048","Alhassan Aliyu Alhassan","M","","Pri 2 Islamiyyah","Active",2022],
      ["FS/22/053","Abubakar Abdulwahhab","M","","Pri 2 Islamiyyah","Active",2022],
      ["FS/22/057","Faisal Muhammad","M","","Pri 2 Islamiyyah","Active",2022],
      ["FS/22/060","Ibrahim Adam","M","","Pri 2 Islamiyyah","Active",2022],
      ["FS/22/063","Rahma Almustapha","F","","Pri 2 Islamiyyah","Active",2022],
      ["FS/23/076","Musa Jibril","M","","Pri 1A Islamiyyah","Active",2023],
      ["FS/23/077","Yusuf Muhammad Kabir","M","","Pri 1A Islamiyyah","Active",2023],
      ["FS/23/079","Fatima Zakariyya","F","","Pri 1A Islamiyyah","Active",2023],
      ["FS/23/080","Halima Muhammad","F","","Pri 1A Islamiyyah","Active",2023],
      ["FS/23/084","Khadija Kabir Bako","F","","Pri 1A Islamiyyah","Active",2023],
      ["FS/23/085","Khadija Jibril","F","","Pri 1A Islamiyyah","Active",2023],
      ["FS/23/089","Rahma Muhammad","F","","Pri 1A Islamiyyah","Active",2023],
      ["FS/23/090","Muhd Kabir Al-Mustapha","M","","Pri 1A Islamiyyah","Active",2023],
      ["FS/24/095","Abdurrahman Idris","M","","Pri 1B Islamiyyah","Active",2024],
      ["FS/24/100","Amina Yusuf Dala","F","","Pri 1B Islamiyyah","Active",2024],
      ["FS/24/104","Hamza Is'haq","M","","Pri 1B Islamiyyah","Active",2024],
      ["FS/24/105","Hauwau Muhammad Anas","F","","Pri 1B Islamiyyah","Active",2024],
      ["FS/24/107","Isah Muhammad Isah","M","","Pri 1B Islamiyyah","Active",2024],
      ["FS/24/109","Khadija Gidado Idris","F","","Pri 1B Islamiyyah","Active",2024],
      ["FS/24/110","Ruqayya Kabir Bako","F","","Pri 1B Islamiyyah","Active",2024],
      ["FS/25/129","Aisha Saminu","F","","Raudah 3","Active",2025],
      ["FS/25/130","Khadija Al-Amin","F","","Raudah 3","Active",2025],
      ["FS/25/134","Amaturrahman Muhd Nasir","F","","Raudah 3","Active",2025],
      ["FS/25/138","Al'amin Ayuba","M","","Raudah 3","Active",2025],
      ["FS/25/140","Hauwau Auwal Sani Mada","F","","Raudah 3","Active",2025],
      ["FS/25/146","Abdallah Muhammad Anas","M","","Raudah 2","Active",2025],
      ["FS/25/148","Ahmad Auwal Sani Mada","M","","Raudah 2","Active",2025],
      ["FS/25/152","Umar M Kabir","M","","Raudah 2","Active",2025],
      ["FS/25/153","Umar Yahya","M","","Raudah 2","Active",2025],
      ["FS/25/162","Hauwa'u Ahmad","F","","Raudah 2","Active",2025],
      ["FS/25/168","Yusuf Yahya","M","","Raudah 2","Active",2025],
      ["FS/25/175","Aisha Muhammad","F","","Raudah 1A","Active",2025],
      ["FS/25/187","Abdulrahman Yusuf Dala","M","","Raudah 1A","Active",2025],
      ["FS/25/190","Idris Gidado Idris","M","","Raudah 1A","Active",2025],
      ["FS/25/198","Abubakar Musa","M","","Raudah 1B","Active",2025],
      ["FS/25/199","Isma'il Ibrahim","M","","Raudah 1B","Active",2025],
      ["FS/25/200","Aliyu Saminu","M","","Raudah 1B","Active",2025],
      ["FS/25/202","Ahmad Auwal","M","","Raudah 1B","Active",2025],
      ["FS/25/203","Dawud Ibrahim","M","","Raudah 1B","Active",2025],
      ["FS/25/211","Halima Shehu","F","","Raudah 1B","Active",2025],
      ["FS/25/212","Habiba Kabir","F","","Raudah 1B","Active",2025],
  ];
  data.forEach(row => sh.appendRow(row));
}

// ── STAFF ────────────────────────────────────────────────────────────────────
function setupStaffSheet() {
  const sh = sheetByName("Staff");
  if (sh.getLastRow() > 0) { Logger.log("Staff sheet already has data — skipping seed."); return; }

  sh.appendRow(["id","name","gender","role","dept","status","year"]);

  const data = [
    ["FSS/ST/001","Aisha Saad","F","Head of Islamiyyah","Islamiyyah","Active",2019],
      ["FSS/ST/002","Mahmud Ibrahim Umar","M","Head of Mutawassid","Islamiyyah","Active",2019],
      ["FSS/ST/003","Amina Harun Muhammad","F","Vice Principal Admin","Administration","Active",2019],
      ["FSS/ST/004","Nafisa Haris","F","Teacher","Islamiyyah","Active",2020],
      ["FSS/ST/005","Fatima Abubakar Usman","F","Teacher","Islamiyyah","Active",2020],
      ["FSS/ST/006","Hafsat M Lawal","F","Teacher","Islamiyyah","Active",2020],
      ["FSS/ST/007","Maimuna Umar","F","Teacher","Islamiyyah","Active",2020],
      ["FSS/ST/008","Muhammad Bukhari Usman","M","Teacher","Islamiyyah","Active",2020],
      ["FSS/ST/009","Maryam Muhammad Sabiu","F","Teacher","Islamiyyah","Active",2020],
      ["FSS/ST/010","Zainab Muhammad","F","Teacher","Conventional","Active",2021],
      ["FSS/ST/011","Amina Yusuf Mshelia","F","Teacher","Conventional","Active",2021],
      ["FSS/ST/012","Hafsat Salihu Mai Riga","F","Teacher","Conventional","Active",2021],
      ["FSS/ST/013","Fatima Attahir","F","Teacher","Conventional","Active",2021],
      ["FSS/ST/014","Nafisa Lukman","F","Teacher","Conventional","Active",2021],
      ["FSS/ST/015","Saudat Sufyan","F","Teacher","Conventional","Active",2021],
      ["FSS/ST/016","Amina Shuaibu","F","Teacher","Conventional","Active",2021],
      ["FSS/ST/017","Amira Muhammad","F","Teacher","Conventional","Active",2021],
      ["FSS/ST/018","Safiyyah Ibrahim","F","Teacher","Conventional","Active",2021],
      ["FSS/ST/019","Zainab Usman","F","Chief Care Giver","Non-Academic","Active",2019],
      ["FSS/ST/020","Asmau Muhammad","F","Care Giver","Non-Academic","Active",2020],
      ["FSS/ST/021","Maryam Ibrahim","F","Care Giver","Non-Academic","Active",2020],
      ["FSS/ST/022","Hauwa Shehu","F","Care Giver","Non-Academic","Active",2020]  ];
  data.forEach(row => sh.appendRow(row));
}

// ── SETTINGS ─────────────────────────────────────────────────────────────────
function setupSettingsSheet() {
  const sh = sheetByName("Settings");
  if (sh.getLastRow() > 0) { Logger.log("Settings sheet already has data — skipping seed."); return; }

  sh.appendRow(["key","value"]);
  sh.appendRow(["session", "2025/2026"]);

  const feeRates = {
    N1:28288, N2:28288, N3:28288,
    P1:28288, P2:28288, P3:28288, P4:28288, P5:28288, P6:28288,
    JSS1:29000, JSS2:29000, JSS3:29000,
    SS1:30000, SS2:30000, SS3:30000,
    DIP1:45000, DIP2:45000,
  };
  Object.entries(feeRates).forEach(([cls, rate]) => {
    sh.appendRow([`feeRate_${cls}`, rate]);
  });
}

// ── ATTENDANCE ───────────────────────────────────────────────────────────────
function setupAttendanceSheet() {
  const sh = sheetByName("Attendance");
  if (sh.getLastRow() > 0) { Logger.log("Attendance sheet already has headers — skipping."); return; }
  sh.appendRow(["date","type","cls","recordsJSON"]);
}

// ── DAAR ─────────────────────────────────────────────────────────────────────
function setupDAARSheet() {
  const sh = sheetByName("DAAR");
  if (sh.getLastRow() > 0) { Logger.log("DAAR sheet already has headers — skipping."); return; }
  sh.appendRow(["id","date","cls","subject","teacher","topic","subtopic","method","reference","homework","scheme","note","time"]);
}

// ── FEES ─────────────────────────────────────────────────────────────────────
function setupFeesSheet() {
  const sh = sheetByName("Fees");
  if (sh.getLastRow() > 0) { Logger.log("Fees sheet already has headers — skipping."); return; }
  sh.appendRow(["admNo","session","discount","concession","arrears","t1","t2","t3"]);
}

// ── SCORES ───────────────────────────────────────────────────────────────────
function setupScoresSheet() {
  const sh = sheetByName("Scores");
  if (sh.getLastRow() > 0) { Logger.log("Scores sheet already has headers — skipping."); return; }
  sh.appendRow(["cls","subject","term","session","admNo","ca1","ca2","ca3","exam","subtopic"]);
}

/**
 * Utility: wipe ALL data (keep headers) — useful for testing.
 * DANGER: This deletes all entered attendance, DAAR, fees, and scores.
 * Run manually from the Apps Script editor only when needed.
 */
function resetAllData() {
  ["Attendance","DAAR","Fees","Scores"].forEach(name => {
    const sh = sheetByName(name);
    const lastRow = sh.getLastRow();
    if (lastRow > 1) sh.deleteRows(2, lastRow - 1);
  });
  Logger.log("✅ Transactional data cleared (Students, Staff, Settings preserved).");
}
