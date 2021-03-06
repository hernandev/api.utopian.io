import * as querystring from 'querystring';
import * as HttpStatus from 'http-status';
import * as request from 'superagent';
import steemAPI from '../steemAPI';
import User from '../models/user.model';
import Moderator from '../models/moderator.model';
import * as Jimp from 'jimp';

/**
 * Load a users avatar with img.busy.com and cloudinary
 */
function avatar(req, res, next) {

    res.header("Content-Type", "image/png");

    const {user} = req.params;

    let avatar_default = 'https://cdn.utopian.io/assets/images/default_avatar.jpg';

    steemAPI.getAccounts([user], (err, accounts) => {
        if (!err) {
            const account = accounts[0];
            let data;
            if (account && account.json_metadata) {
                data = JSON.parse(account.json_metadata);
                if (data.profile && data.profile.profile_image) {
                    Jimp.read(data.profile.profile_image, function (err, avatar) {
                        try {
                            avatar.quality(100).getBuffer(Jimp.MIME_PNG, function (err, buffer) {
                                if (err) {
                                    Jimp.read(avatar_default, function (err, avatar) {
                                        avatar.quality(100).getBuffer(Jimp.MIME_PNG, function (err, buffer) {
                                            res.set("Content-Type", Jimp.MIME_PNG);
                                            res.send(buffer);
                                        });
                                    });
                                } else {
                                    res.set("Content-Type", Jimp.MIME_PNG);
                                    res.send(buffer);
                                }

                            });
                        } catch (e) {
                            Jimp.read(avatar_default, function (err, avatar) {
                                avatar.quality(100).getBuffer(Jimp.MIME_PNG, function (err, buffer) {
                                    res.set("Content-Type", Jimp.MIME_PNG);
                                    res.send(buffer);
                                });
                            });
                        }
                    });
                } else {
                    Jimp.read(avatar_default, function (err, avatar) {
                        avatar.quality(100).getBuffer(Jimp.MIME_PNG, function (err, buffer) {
                            res.set("Content-Type", Jimp.MIME_PNG);
                            res.send(buffer);
                        });
                    });
                }
            } else {
                Jimp.read(avatar_default, function (err, avatar) {
                    avatar.quality(100).getBuffer(Jimp.MIME_PNG, function (err, buffer) {
                        res.set("Content-Type", Jimp.MIME_PNG);
                        res.send(buffer);
                    });
                });
            }
        } else {
            Jimp.read(avatar_default, function (err, avatar) {
                avatar.quality(100).getBuffer(Jimp.MIME_PNG, function (err, buffer) {
                    res.set("Content-Type", Jimp.MIME_PNG);
                    res.send(buffer);
                });
            });
        }
    });


}

/**
 * Load a users avatar with img.busy.com and cloudinary
 */
function cover(req, res, next) {

    res.header("Content-Type", "image/png");

    const {user} = req.params;

    let avatar_default = 'https://cdn.utopian.io/assets/images/default_cover.jpg';

    steemAPI.getAccounts([user], (err, accounts) => {
        if (!err) {
            const account = accounts[0];
            let data;
            if (account && account.json_metadata) {
                data = JSON.parse(account.json_metadata);
                if (data.profile && data.profile.cover_image) {
                    Jimp.read(data.profile.cover_image, function (err, avatar) {
                        avatar.quality(100).getBuffer(Jimp.MIME_PNG, function (err, buffer) {
                            if (err) {
                                Jimp.read(avatar_default, function (err, avatar) {
                                    avatar.quality(100).getBuffer(Jimp.MIME_PNG, function (err, buffer) {
                                        res.set("Content-Type", Jimp.MIME_PNG);
                                        res.send(buffer);
                                    });
                                });
                            } else {
                                res.set("Content-Type", Jimp.MIME_PNG);
                                res.send(buffer);
                            }

                        });
                    });
                } else {
                    Jimp.read(avatar_default, function (err, avatar) {
                        avatar.quality(100).getBuffer(Jimp.MIME_PNG, function (err, buffer) {
                            res.set("Content-Type", Jimp.MIME_PNG);
                            res.send(buffer);
                        });
                    });
                }
            } else {
                Jimp.read(avatar_default, function (err, avatar) {
                    avatar.quality(100).getBuffer(Jimp.MIME_PNG, function (err, buffer) {
                        res.set("Content-Type", Jimp.MIME_PNG);
                        res.send(buffer);
                    });
                });
            }

        } else {
            Jimp.read(avatar_default, function (err, avatar) {
                avatar.quality(100).getBuffer(Jimp.MIME_PNG, function (err, buffer) {
                    res.set("Content-Type", Jimp.MIME_PNG);
                    res.send(buffer);
                });
            });
        }
    });


}

/**
 * Ban user
 * @property {string} req.body.username - The username of user.
 * @property {string} req.body.banned - Banning Status of user
 * @returns {User}
 **/
function ban(req, res, next) {
    console.log("=> ban() ");
    const user = req.user;
    // console.log("-> req.user ", req.user);
    console.log("-> req.body ", req.body);
    user.banned = req.body.banned;
    user.bannedBy = req.body.bannedBy;
    user.banReason = req.body.banReason;
    user.bannedUntil = req.body.bannedUntil;

    user.save()
        .then(savedUser => res.json({
            banned: savedUser.banned,
            bannedBy: savedUser.bannedBy,
            banReason: savedUser.banReason,
            bannedUntil: savedUser.bannedUntil
        })).catch(e => next(e));
}

function getBan(req, res, next) {
    console.log("=> getban(user) ");
    const user = req.user;
    var until = new Date(0);
    if (user.bannedUntil) {
        until = user.bannedUntil;
    }
    res.json({
        banned: user.banned,
        bannedBy: user.bannedBy,
        banReason: user.banReason,
        bannedUntil: until,
    });
}

/**
 * Get user
 * @returns {User}
 */
function get(req, res) {
    const user = req.user;
    return res.json({
        account: user.account,
        banReason: user.banReason,
        bannedBy: user.bannedBy,
        bannedUntil: user.bannedUntil,
        banned: user.banned,
        details: user.details,
        repos: user.repos ? (user.repos) : undefined,
        tos: user.tos,
        privacy: user.privacy,
        reputation: user.reputation,
        influence: user.influence,
        github: user.github ? {
            login: user.github.login,
            account: user.github.account,
            scopeVersion: user.github.scopeVersion,
            lastSynced: (user.github.lastSynced) ? (user.github.lastSynced) : undefined,
            avatar_url: user.github.avatar_url,
        } : undefined
    });
}

function getGithubRepos(user, callback) {
    var result = new Array();
    if (!user || !user.github || !user.github.token) {
        return callback(result);
    }

    request.get('https://api.github.com/user/repos')
        .query({access_token: user.github.token, per_page: 100})
        .then(function (response) {
            if (response && response.body.length) {
                const repos = (response.body.filter(repo => repo.owner.login === user.github.account && repo.private === false));
                for (var k = 0; k < repos.length; k++) {
                    result.push(repos[k]);
                }
                var orgs = new Array();
                request.get('https://api.github.com/user/orgs')
                    .query({access_token: user.github.token, per_page: 100})
                    .then(function (resp) {
                        if (resp && resp.body) {
                            const organizations = resp.body;
                            for (var i = 0; i < organizations.length; i++) {
                                orgs.push(organizations[i].login);
                            }
                            if (orgs.length === 0) {
                                callback(result);
                                return;
                            }
                            for (var j = 0; j < orgs.length; ++j) {
                                request.get(`https://api.github.com/orgs/${orgs[j]}/repos`)
                                    .query({access_token: user.github.token, per_page: 100})
                                    .then(function (respo) {
                                        if (respo && respo.body) {
                                            for (var m = 0; m < respo.body.length; ++m) {
                                                result.push(respo.body[m]);
                                            }
                                            if (j + 1 >= orgs.length) {
                                                callback(result);
                                                return;
                                            }
                                        }
                                    }).catch(() => {
                                    callback(result);
                                })
                            }
                        } else {
                            callback(result);
                        }
                    }).catch(() => {
                    callback(result);
                })
            } else {
                callback(result);
            }
        }).catch(e => {
        if (e.status === 401) {
            user.github = undefined;
            user.save();
        } else {
            console.error(e);
        }
        callback(result);
    });
}

function getRepos(req, res, next) {
    const user = req.user;

    if (!user) {
        res.json([]);
    }

    getGithubRepos(user, (result) => {
        if (result.length) {
            res.json(result);
        } else {
            res.status(404).json({
                message: 'No repos found on Github'
            })
        }
    });
}

async function create(req, res, next) {
    const {code, state, scopeVersion} = req.body;
    if (!(code && state && (code !== "-") && (state !== "-"))) {
        return res.sendStatus(HttpStatus.BAD_REQUEST);
    }

    try {
        const tokenRes = await (request.post('https://github.com/login/oauth/access_token')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send({
                code,
                state,
                client_id: process.env.UTOPIAN_GITHUB_CLIENT_ID,
                client_secret: process.env.UTOPIAN_GITHUB_SECRET,
                redirect_uri: process.env.UTOPIAN_GITHUB_REDIRECT_URL,
            }));
        const access_token = tokenRes.body.access_token;
        if (!access_token) {
            return res.sendStatus(500);
        }

        const githubUserRes = await (request.get('https://api.github.com/user')
            .query({access_token}));
        const githubUser = githubUserRes.body;
        const githubUserName = githubUser.login;
        if (!githubUserName) {
            return res.sendStatus(500);
        }

        const user = res.locals.user;
        user.github = {
            account: githubUserName,
            token: access_token,
            scopeVersion: scopeVersion,
            lastSynced: new Date(),
            ...githubUser,
        };

        req.user = await user.save();
        get(req, res);
    } catch (e) {
        console.log('Error syncing GitHub', e);
        return res.sendStatus(500);
    }
}


async function approveTOS(req, res, next) {
    let user = req.user;
    let userIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // No user -> No access?
    if (!user)
        return res.sendStatus(550);

    user.tos.push({
        date: new Date(),
        ip: userIp
    });

    // Map aggreements without accept
    user.tos = user.tos.map(agreement => {
        return {
            date: agreement.date,
            ip: agreement.ip,
        }
    });
    user.save()
        .then(savedUser => res.json({
            approved: true,
        })).catch(e => next(e));
}


async function approvePrivacy(req, res, next) {
    let user = req.user;
    let userIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    // No user -> No access?
    if (!user)
        return res.sendStatus(550);

    user.privacy.push({
        date: new Date(),
        ip: userIp
    });

    // Map aggreements without accept
    user.privacy = user.privacy.map(agreement => {
        return {
            date: agreement.date,
            ip: agreement.ip,
        }
    });
    user.save()
        .then(savedUser => res.json({
            approved: true,
        })).catch(e => next(e));
}

export default {avatar, ban, getBan, cover, get, getRepos, getGithubRepos, create, approveTOS, approvePrivacy};
