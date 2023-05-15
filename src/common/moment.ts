import moment from "moment-timezone";
moment.tz.setDefault(process.env.DEFAULT_TIMEZONE);
export default moment;