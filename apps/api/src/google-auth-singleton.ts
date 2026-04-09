import { GoogleAuth } from "google-auth-library";

export const googleAuth = new GoogleAuth({
  scopes: "https://www.googleapis.com/auth/cloud-platform",
});
