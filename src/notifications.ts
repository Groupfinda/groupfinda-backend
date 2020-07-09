import axios from 'axios'

export async function sendGroupNotification(expoPushToken: string) {
    const message = {
        to: expoPushToken,
        sound: 'default',
        title: 'Groupfinda',
        body: 'You got a new group!',
    };
    console.log("Sending to ", expoPushToken)


    try {
        await axios.post('https://exp.host/--/api/v2/push/send', message, {
            headers: {
                "Accept": "application/json",
                "Accept-encoding": "gzip, deflate",
                "Content-Type": "application/json"
            }
        })

        console.log("Sent")
    } catch (err) {
        console.log(err)
    }

}
/*
fetch(, {
    method: 'POST',
    headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
});
*/