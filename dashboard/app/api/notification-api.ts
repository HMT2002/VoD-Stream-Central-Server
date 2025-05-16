import axios from "axios";
import { useSession } from "next-auth/react";
import { url } from "@/app/lib/constants";
import { Topic, Notification } from "../types/types";

export async function POSTaddNotification(notification: Notification) {
  try {
    const formData = new FormData();
    formData.append("tieu_de", notification.tieu_de || "");
    formData.append("noi_dung", notification.noi_dung || "");
    if (notification.file)
      for (let i = 0; i < notification.file.length; i++) {
        formData.append("file", notification.file[i]);
      }
    await axios.post(url + `v1/notification/addNotification`, formData);
  } catch (err) {
    throw err;
  }
}

export async function GETgetAllNotification() {
  try {
    const response = await axios.get(
      url + `v1/notification/getAllNotifications`
    );
    return response.data;
  } catch (err) {
    throw err;
  }
}

export async function PUTupdateNotification(notification: Notification) {
  try {
    await axios.put(
      url + `v1/notification/updateNotification/${notification._id}`,
      {
        tieu_de: notification.tieu_de,
        // topic_description: topic.topic_description,
        noi_dung: notification.noi_dung,
      }
    );
  } catch (err) {
    throw err;
  }
}
