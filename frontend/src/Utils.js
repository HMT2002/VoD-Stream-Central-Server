import { format, getDate } from "date-fns";

class Utils {
    static DateConverter(date) {
        const today = Date.now;
        const offset = getDate(today - date);

        if (offset === 0)
            return "Today";
        if (offset > 0 && offset <= 7)
            return `${offset} ${offset > 1 ? "days" : "day"} ago`;
        if (offset > 7)
            return format(date, "dd-MM-yyyy").toString();
    };

    static DateFormatter(date) {
        const realDate = new Date(date);
        return format(realDate, "dd-MM-yyyy").toString();
    }

    static EmptyValueValidator = (value) => {
        return value.trim().length === 0;
    }

    static PhoneNumberValidator = (phoneNumber) => {
        return phoneNumber.trim().match(/^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/) !== null
            && phoneNumber.trim().length > 0;
    }

    static RandomString = (length) => {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < length) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
          counter += 1;
        }
        return result;
    }

}

export default Utils;