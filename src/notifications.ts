import axios from 'axios'

export async function sendGroupNotification(expoPushToken: string, groupId: string) {
    const message = {
        to: expoPushToken,
        sound: 'default',
        title: 'Groupfinda',
        body: 'You got a new group!',
        data: { type: 'GROUP', id: groupId },
        channelId: "Groupfinda"
    };
    console.log("Sending group notification to ", expoPushToken)


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

export function sendMessageNotification(expoPushToken: string, groupTitle: string, groupId: string) {
    const message = {
        to: expoPushToken,
        sound: 'default',
        title: 'Groupfinda',
        body: `You got a message from ${groupTitle}`.slice(0, 100),
        data: { type: 'MESSAGE', id: groupId },
        channelId: "Groupfinda"
    };

    console.log("Sending message notification to ", expoPushToken)

    return axios.post('https://exp.host/--/api/v2/push/send', message, {
        headers: {
            "Accept": "application/json",
            "Accept-encoding": "gzip, deflate",
            "Content-Type": "application/json"
        }
    })
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