import { EMBED_ERROR_COLOR, EMBED_INFO_COLOR, EMBED_SUCCESS_COLOR, makeError, parseCommand, registerCommand, sendReply } from '../../utils';

/**
 * !configure cannedreplies.enabled [true|false]
 */
registerCommand('configure', ['conf'], message => {
    const [namespace, option, value] = parseCommand(message, /(.*?)\.(.*?) (.*)/);

    if (namespace === 'cannedreplies') {

    } else {
        sendReply(message, EMBED_ERROR_COLOR, makeError('Unknown configuration option'));
    }
});
