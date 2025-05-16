import axios from "axios";
import { url } from "@/app/lib/constants";
import { Topic, Notification, DeadlineItemObj } from "../types/types";

export async function POSTaddDeadline({
  deadline,
  teacher_id,
}: {
  deadline: DeadlineItemObj;
  teacher_id: string;
}) {
  // try {
  //   await axios
  //     .post(url + `v1/deadline/addDeadline/${teacher_id}`, {
  //       tieu_de: deadline?.tieu_de,
  //       noi_dung: deadline?.noi_dung,
  //       ngay_bat_dau: deadline?.ngay_bat_dau,
  //       ngay_ket_thuc: deadline?.ngay_ket_thuc,
  //     })
  //     .then((res) => {
  //       console.log(
  //         "Tạo deadline thành công: " +
  //           res.data.tieu_de +
  //           ", " +
  //           res.data.noi_dung
  //       );
  //     });
  // } catch (err) {
  //   throw err;
  // }
  try {
    const formData = new FormData();
    formData.append("tieu_de", deadline.tieu_de || "");
    formData.append("noi_dung", deadline.noi_dung || "");
    formData.append("ngay_bat_dau", deadline.ngay_bat_dau || "");
    formData.append("ngay_ket_thuc", deadline.ngay_ket_thuc || "");
    if (deadline.file)
      for (let i = 0; i < deadline.file.length; i++) {
        formData.append("file", deadline.file[i]);
      }
    await axios.post(url + `v1/deadline/addDeadline/${teacher_id}`, formData);
  } catch (err) {
    throw err;
  }
}

export async function PUTupdateStatusDeadline({
  studentID,
  deadlineID,
  file,
}: {
  studentID: string;
  deadlineID: string;
  file: File;
}) {
  try {
    const formData = new FormData();
    if (file) formData.append("file", file);
    await axios.put(
      url + `v1/deadline/done_deadline/${studentID}&${deadlineID}`,
      formData
    );
  } catch (err) {
    throw err;
  }
}

export async function GETgetDeadlineByID(deadline_id: string | undefined) {
  try {
    const response = await axios.get(
      url + `v1/deadline/deadlineById/${deadline_id}`
    );
    console.log("Deadline Item: " + response.data);
    return response.data;
  } catch (err) {
    throw err;
  }
}

export async function GETgetAllDeadlineByTeacherID(
  teacher_id: string | undefined
) {
  try {
    const response = await axios.get(
      url + `v1/deadline/allDeadlinesByTeacherId/${teacher_id}`
    );
    return response.data;
  } catch (err) {
    throw err;
  }
}

export async function GETgetSubmitDeadlineByDeadlineID(
  deadline_id: string | undefined
) {
  try {
    const response = await axios.get(
      url + `v1/submitDeadline/getSubmitDeadlineById/${deadline_id}`
    );
    return response.data;
  } catch (err) {
    throw err;
  }
}
