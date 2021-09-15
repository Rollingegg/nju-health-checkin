# NJU Health Checkin

## Usage

```
python -m pip install -r requirements.txt
NJU_USER=xxx NJU_PASS=xxx python checkin.py
```

## Github Actions

1. Set `NJU_USER` and `NJU_PASS` in settings/secrets.

2. ~~(Optional) Set `TELEGRAM_TOKEN` and `TELEGRAM_TO` secrets. [(appleboy/telegram-action)](https://github.com/appleboy/telegram-action#secrets)~~

3. (Optional) Set `FEISHU_ROBOT_UUID` and `FEISHU_ROBOT_SECRET` secrets. [(Rollingegg/feishu-robot-action)](https://github.com/Rollingegg/feishu-robot-action)

- The job will be automatically executed at 9:00 am UTC+8 (may be delayed up to 1 hour due to GitHub's issues with cron actions).

- You can also trigger the job and set `NJU_USER` and `NJU_PASS` manually by using `workflow_dispatch`.

## Credits

- [checkin.py](checkin.py) is written by [Maxwell Lyu](https://github.com/Maxwell-Lyu).
