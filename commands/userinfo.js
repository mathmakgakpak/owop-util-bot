module.exports = {
    name: "userinfo",
    aliases: [],
    description: "f",
    run(message, args) {
        let user = message.mentions.users.first() || message.author;

        const embed = new Discord.MessageEmbed()
            .setColor(utils.rgbToHex(...utils.randomColor()))
            .setThumbnail(user.avatarURL({
                dynamic: true
            }))
            .setTitle('User info')
            .addField('Username', user.username)
            .addField('User id', user.id)
            .addField('discriminator', user.discriminator)
            .addField('Created At', user.createdAt);

        message.channel.send(embed);
    }
}