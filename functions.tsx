
export function convertToSlug(text: string) {
    return text
        .trim()
        .toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-')
        ;
}



export function snapshotToArray(snapshot: firebase.firestore.QuerySnapshot) {
    var returnArr = [];

    snapshot.forEach((childSnapshot) => {
        var item = childSnapshot.data();
        item.key = childSnapshot.id;

        returnArr.push(item);
    });

    return returnArr;
};

export function validateEmail(text) {
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return reg.test(text)
}

export function remainingBoosts(tokenVotes) {
    if (!tokenVotes) return 0
    return tokenVotes.length
}