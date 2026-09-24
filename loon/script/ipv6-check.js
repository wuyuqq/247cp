const KEY = "IPv6_Address_Check_Last";

$httpClient.get("https://api6.ipify.org", function(error, response, data) {
    if (error || !data) {
        console.log("IPv6 检测失败: " + error);
        $done();
        return;
    }

    const currentIPv6 = data.trim();

    // 简单确认返回的是 IPv6
    if (!currentIPv6.includes(":")) {
        console.log("当前没有检测到 IPv6: " + currentIPv6);
        $done();
        return;
    }

    const oldIPv6 = $persistentStore.read(KEY);

    // 第一次检测，只记录，不通知
    if (!oldIPv6) {
        $persistentStore.write(currentIPv6, KEY);
        console.log("首次记录 IPv6: " + currentIPv6);
        $done();
        return;
    }

    // IPv6 没变化
    if (oldIPv6 === currentIPv6) {
        console.log("IPv6 未变化: " + currentIPv6);
        $done();
        return;
    }

    // IPv6 发生变化
    $persistentStore.write(currentIPv6, KEY);

    $notification.post(
        "IPv6 地址发生变化",
        "检测到公网 IPv6 已更新",
        oldIPv6 + " → " + currentIPv6
    );

    console.log("IPv6 已变化: " + oldIPv6 + " → " + currentIPv6);

    $done();
});