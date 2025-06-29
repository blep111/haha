const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: "leaveNoti",
  version: "2.0.0", 
  description: "Professional leave notifications with aesthetic design",
  author: "Vern",
  async onEvent({ api, event, prefix }) {
    try {
      const { logMessageType, logMessageData, threadID } = event;

      if (
        logMessageType === "log:unsubscribe" &&
        logMessageData.leftParticipantFbId === api.getCurrentUserID()
      ) {
        api.changeNickname(
          `[ ${prefix} ]: NashBoT`,
          threadID,
          api.getCurrentUserID()
        );

        const leaveMessage = `
┌────────────────────────┐
│ 👾 𝐕𝐄𝐑𝐍 IS OFFLINE     │
└────────────────────────┘

💔 Connection Terminated

🔌 Bot disconnected from chat
⚡ Smart features offline
📱 Services unavailable

🛠️ Need to reconnect?
• Contact administrators
• Re-invite the bot anytime
• Use ${prefix}help when back

─────────────────────────
👋 Thanks for using 𝐑𝐄𝐕𝐍!
─────────────────────────`;

        api.sendMessage(leaveMessage, threadID);
      } else if (
        logMessageType === "log:unsubscribe" &&
        logMessageData.leftParticipantFbId !== api.getCurrentUserID()
      ) {
        const { leftParticipantFbId } = logMessageData;

        const leftUserInfo = await api.getUserInfo(leftParticipantFbId);
        const leftUserName = leftUserInfo[leftParticipantFbId]?.name || "Unknown User";

        const threadInfo = await api.getThreadInfo(threadID);
        const currentMembersCount = threadInfo.participantIDs.length;
        const leaveTime = new Date().toLocaleString();

        const leaveMessage = `
┌────────────────────────┐
│     👋 𝐅𝐀𝐑𝐄𝐖𝐄𝐋𝐋        │
└────────────────────────┘

😔 ${leftUserName} left the group

👤 ${leftUserName}
🏠 ${threadInfo.name}
👥 ${currentMembersCount} members left
📅 ${leaveTime}

💭 Farewell Message:
"Every goodbye is a new beginning.
Thanks for the memories shared.
The door is always open!"

🌟 To remaining members:
• Keep building great memories
• Stay positive and friendly
• ${leftUserName} welcome back anytime!

─────────────────────────
🤝 𝐔𝐧𝐭𝐢𝐥 𝐰𝐞 𝐦𝐞𝐭 𝐚𝐠𝐚𝐢𝐧!
─────────────────────────`;

        const gifUrl = "https://media3.giphy.com/media/vxNCVEe0PI9A3YVJEX/giphy.gif?cid=6c09b952ygxao9r8x79t3enqjb9z02khzf36dntnwqyhcqm2&ep=v1_internal_gif_by_id&rid=giphy.gif&ct=g";
        const gifPath = path.join(__dirname, 'farewell.gif');

        const downloadGif = async (url, path) => {
          const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream',
          });
          return new Promise((resolve, reject) => {
            response.data.pipe(fs.createWriteStream(path))
              .on('finish', () => resolve())
              .on('error', e => reject(e));
          });
        };

        try {
          await downloadGif(gifUrl, gifPath);
          const gifStream = fs.createReadStream(gifPath);

          api.sendMessage({
            body: leaveMessage,
            attachment: gifStream
          }, threadID, () => {

            if (fs.existsSync(gifPath)) {
              fs.unlinkSync(gifPath);
            }
          });
        } catch (downloadError) {

          console.error('Error downloading farewell gif:', downloadError);
          api.sendMessage(leaveMessage, threadID);
        }
      }
    } catch (error) {
      console.error('Error in leaveNoti event:', error);
      api.sendMessage('⚠️ An error occurred while processing the departure notification.', event.threadID);
    }
  },
};