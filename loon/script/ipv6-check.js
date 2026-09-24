/*
 * IPv6 地址变化检测
 * Loon 3.5.1(998)
 *
 * 参数：
 * enabled = 是否启用
 * ssid    = 指定 SSID，多个 SSID 使用英文逗号分隔
 *
 * SSID 留空：不限制网络
 */

const STORAGE_KEY = "IPv6_Address_Check_Last";

// ====================
// 读取插件参数
// ====================

const args = $argument || {};

const enabled = String(args.enabled || "true");
const allowedSSID = String(args.ssid || "").trim();


// ====================
// 检查插件是否启用
// ====================

if (enabled === "false") {
    console.log("IPv6 检测已关闭");
    $done();
    return;
}


// ====================
// 获取当前 SSID
// ====================

let currentSSID = "";

try {
    const config = JSON.parse($config.getConfig() || "{}");

    /*
     * Loon 配置中的 SSID
     */
    currentSSID = String(config.ssid || "").trim();

} catch (error) {

    console.log("读取当前 SSID 失败：" + error);
}


// ====================
// SSID 判断
// ====================

if (allowedSSID !== "") {

    const ssidList = allowedSSID
        .split(",")
        .map(function (item) {
            return item.trim();
        })
        .filter(function (item) {
            return item !== "";
        });

    console.log("当前 SSID：" + currentSSID);
    console.log("允许的 SSID：" + ssidList.join(", "));

    if (!ssidList.includes(currentSSID)) {

        console.log("当前 SSID 不在指定列表中，跳过 IPv6 检测");

        $done();
        return;
    }

} else {

    console.log("未指定 SSID，不限制当前网络");

}


// ====================
// 获取公网 IPv6
// ====================

$httpClient.get(
    "https://api6.ipify.org",
    function (error, response, data) {

        if (error) {

            console.log("IPv6 检测失败：" + error);

            $done();
            return;
        }


        // ====================
        // 检查返回结果
        // ====================

        if (!data) {

            console.log("IPv6 检测失败：服务器没有返回数据");

            $done();
            return;
        }


        const currentIPv6 = data.trim();


        // ====================
        // 判断是否为 IPv6
        // ====================

        if (!currentIPv6.includes(":")) {

            console.log(
                "检测结果不是 IPv6：" + currentIPv6
            );

            $done();
            return;
        }


        console.log("当前公网 IPv6：" + currentIPv6);


        // ====================
        // 读取上一次 IPv6
        // ====================

        const oldIPv6 = $persistentStore.read(STORAGE_KEY);


        // ====================
        // 第一次检测
        // ====================

        if (!oldIPv6) {

            $persistentStore.write(
                currentIPv6,
                STORAGE_KEY
            );

            console.log(
                "首次检测，已保存 IPv6：" + currentIPv6
            );

            $done();
            return;
        }


        // ====================
        // IPv6 没有变化
        // ====================

        if (oldIPv6 === currentIPv6) {

            console.log(
                "IPv6 未发生变化：" + currentIPv6
            );

            $done();
            return;
        }


        // ====================
        // IPv6 发生变化
        // ====================

        console.log(
            "IPv6 发生变化：" +
            oldIPv6 +
            " → " +
            currentIPv6
        );


        // ====================
        // 保存新的 IPv6
        // ====================

        $persistentStore.write(
            currentIPv6,
            STORAGE_KEY
        );


        // ====================
        // 获取当前时间
        // ====================

        const now = new Date();

        const time =
            now.getFullYear() + "-" +
            String(now.getMonth() + 1).padStart(2, "0") + "-" +
            String(now.getDate()).padStart(2, "0") + " " +
            String(now.getHours()).padStart(2, "0") + ":" +
            String(now.getMinutes()).padStart(2, "0") + ":" +
            String(now.getSeconds()).padStart(2, "0");


        // ====================
        // 发送通知
        // ====================

        $notification.post(
            "IPv6 地址发生变化",
            time,
            "当前 IPv6:\n" +
            currentIPv6 +
            "\n\n" +
            "上一次 IPv6:\n" +
            oldIPv6
        );


        $done();
    }
);
