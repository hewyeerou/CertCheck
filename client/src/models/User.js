import { ref, set, get, child, update, remove } from "firebase/database";
import { db } from "../firebase-config";

export async function addUser(walletAddress, name, email, password, role, img) {

  set(ref(db, 'users/' + walletAddress), {
    walletAddress: walletAddress,
    name: name,
    email: email,
    password: password,
    role: role,
    img: img
  }).catch((error) => {
    console.log(error);
  });

}

export async function getUserByAddress(walletAddress) {

  get(child(ref(db), 'users/${walletAddress}')).then((snapshot) => {
    if (snapshot.exists()) {
      console.log(snapshot.val());
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
    if (snapshot.exists()) {
      var loggedInUser;
      snapshot.forEach((user) => {
        if (loginDetails.email === user.val().email && loginDetails.password === user.val().password
          && loginDetails.role === user.val().role) {
          loggedInUser = user.val();
          return true;
        } else {
          throw "User not available."
        }
      })
      return loggedInUser;
    }
  });
}