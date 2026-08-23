export const userDbTableLog = [
  { table: "master_user", purpose: "Primary account, subscription dates, plan, and account status." },
  { table: "sub_user", purpose: "Login identity. master_id links every user action to the master account." },
  { table: "users_data_limitation", purpose: "Search and download limits shown after login." },
  { table: "users_download_points", purpose: "Download credit allocation per master account." },
  { table: "user_data_availability", purpose: "Countries and datasets authorized for the user." },
  { table: "search_log", purpose: "Search payload log for every protected search request." },
  { table: "my_downloads", purpose: "Download audit history and user download table." },
  { table: "user_wise_download_n_search", purpose: "Download/search usage counters by user and dataset." },
  { table: "my_favourite", purpose: "Saved tables and workspace records." },
];
