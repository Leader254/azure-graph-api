export const msalConfig = {
  auth: {
    clientId: "",
    authority: "https://login.microsoftonline.com/",
    redirectUri: "http://localhost:5173",
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ["User.Read", "Calendars.Read", "Team.ReadBasic.All"],
};
