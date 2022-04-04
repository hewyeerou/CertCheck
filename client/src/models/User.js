import { ref, set, get, child, update, remove } from "firebase/database";
import { db } from "../firebase-config";

export async function addUser(walletAddress, name, email, password, type, img) {

    set(ref(db, 'users/' + walletAddress), {
        walletAddress: walletAddress,
        name: name,
        email: email,
        password: password,
        type: type,
        img: img
      }).catch((error) => {
          console.log(error);
      });

}

export async function getUserByAddress(walletAddress) {

  return get(child(ref(db), `users/${walletAddress}`)).then((snapshot) => {
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      console.log("User not available");
    }
  }).catch((error) => {
    console.error(error);
  });

}

export async function updateUser(user) {

  const updates = {};

  updates['/users/' + user.walletAddress] = user;

  return update(ref(db), updates).catch((error) => {
    console.log(error);
  });
}

export async function deleteUser(user) {

  remove(ref(db), 'users/' + user.walletAddress).catch((error) => {
    console.log(error);
  });
}

export async function loginWithEmailAndPassword(loginDetails) {
  return get(child(ref(db), 'users')).then((snapshot) => {
    // Find user in db
    if (snapshot.exists()) {
      var loggedInUser;
      var ifExist = false;
      snapshot.forEach((user) => {
        if (loginDetails.email === user.val().email && loginDetails.password === user.val().password
          && loginDetails.role === user.val().type) {
          loggedInUser = user.val();
          ifExist = true;
        }
      })
    // IF exist user in db
      if(ifExist) {
        return loggedInUser;
      }
    }
    throw "User not available";
  });
}

export async function checkAddressExist(walletAddress) {
  return get(child(ref(db), 'users/' + walletAddress)).then((snapshot) => {
    // Find user in db
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return false;
  });
}

export async function getAllUsers() {
  return get(child(ref(db), 'users')).then((snapshot) => {
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      console.log("User not available");
    }
  }).catch((error) => {
    console.error(error);
  });

}