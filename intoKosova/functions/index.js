const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.createUserDocument = functions.auth.user().onCreate(async (user) => {
  const userRef = admin.firestore().collection("users").doc(user.uid);

  const userData = {
    uid: user.uid,
    email: user.email || null,
    displayName: user.displayName || null,
    photoURL: user.photoURL || null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await userRef.set(userData);

  console.log("Created user document for:", user.uid);
});
