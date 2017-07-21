/**
 * Created by marek on 21.6.2017.
 */
var Label = function Label(text, lang) {
    return {
        text: text || "",
        lang: lang || "en",
        init: function init(text, lang) {
            if (text != "") this.text = text;
            if (lang != null && lang != "") this.lang = lang;
            else this.lang = "en";
        }
    }
};

module.exports = Label;
