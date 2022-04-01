import { ref, set, get, child, update, remove } from "firebase/database";
import { db } from "../firebase-config";

export async function addIssued(issuerWalletAddress, studentWalletAddress, certId) {

    set(ref(db, 'issued/' + issuerWalletAddress + '/' + certId), {
        issuerWalletAddress: issuerWalletAddress,
        studentWalletAddress: studentWalletAddress,
        certId: certId,
      }).catch((error) => {
          console.log(error);
      });
}

export async function getAllIssuedCertByIssuers(issuerWalletAddress) {

    return get(child(ref(db), 'issued/${issuerWalletAddress}')).then((snapshot) => {
      if (snapshot.exists()) {
        console.log(snapshot.val());
      } else {
        console.log("User not available");
      }
    }).catch((error) => {
      console.error(error);
    });
}

export async function revokeCertificate(issuerWalletAddress, certId) {

    remove(ref(db), 'issued/' + issuerWalletAddress + '/' + certId).catch((error) => {
      console.log(error);
    });
  }