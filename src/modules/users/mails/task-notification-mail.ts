import { config } from '../../../app/config/index';
import { sendEmail } from '../../integrations/email.service';

export const taskNotification = async (options: {
  email: string;
  user: any;
  slug: any;
}) => {
  const { email, user, slug } = options;
  const output = `
  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="color-scheme" content="light" />
      <meta name="supported-color-schemes" content="light" />
    </head>
    <body
      style="
        box-sizing: border-box;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
          Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji',
          'Segoe UI Symbol';
        position: relative;
        -webkit-text-size-adjust: none;
        background-color: #ffffff;
        color: #718096;
        height: 100%;
        line-height: 1.4;
        margin: 0;
        padding: 0;
        width: 100% !important;
      "
    >
      <style>
        @media only screen and (max-width: 600px) {
          .inner-body {
            width: 100% !important;
          }
  
          .footer {
            width: 100% !important;
          }
        }
  
        @media only screen and (max-width: 500px) {
          .button {
            width: 100% !important;
          }
        }
      </style>
      <table
        class="wrapper"
        width="100%"
        cellpadding="0"
        cellspacing="0"
        role="presentation"
        style="
          box-sizing: border-box;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
            Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji',
            'Segoe UI Symbol';
          position: relative;
          -premailer-cellpadding: 0;
          -premailer-cellspacing: 0;
          -premailer-width: 100%;
          background-color: #edf2f7;
          margin: 0;
          padding: 0;
          width: 100%;
        "
      >
        <tr>
          <td
            align="center"
            style="
              box-sizing: border-box;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
                Helvetica, Arial, sans-serif, 'Apple Color Emoji',
                'Segoe UI Emoji', 'Segoe UI Symbol';
              position: relative;
            "
          >
            <table
              class="content"
              width="100%"
              cellpadding="0"
              cellspacing="0"
              role="presentation"
              style="
                box-sizing: border-box;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
                  Helvetica, Arial, sans-serif, 'Apple Color Emoji',
                  'Segoe UI Emoji', 'Segoe UI Symbol';
                position: relative;
                -premailer-cellpadding: 0;
                -premailer-cellspacing: 0;
                -premailer-width: 100%;
                margin: 0;
                padding: 0;
                width: 100%;
              "
            >
              <tr>
                <td
                  class="header"
                  style="
                    box-sizing: border-box;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                      Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji',
                      'Segoe UI Emoji', 'Segoe UI Symbol';
                    position: relative;
                    padding: 25px 0;
                    text-align: center;
                  "
                ></td>
              </tr>
  
              <!-- Email Body -->
              <tr>
                <td
                  class="body"
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  style="
                    box-sizing: border-box;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                      Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji',
                      'Segoe UI Emoji', 'Segoe UI Symbol';
                    position: relative;
                    -premailer-cellpadding: 0;
                    -premailer-cellspacing: 0;
                    -premailer-width: 100%;
                    background-color: #edf2f7;
                    border-bottom: 1px solid #edf2f7;
                    border-top: 1px solid #edf2f7;
                    margin: 0;
                    padding: 0;
                    width: 100%;
                  "
                >
                  <table
                    class="inner-body"
                    align="center"
                    width="570"
                    cellpadding="0"
                    cellspacing="0"
                    role="presentation"
                    style="
                      box-sizing: border-box;
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                        Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji',
                        'Segoe UI Emoji', 'Segoe UI Symbol';
                      position: relative;
                      -premailer-cellpadding: 0;
                      -premailer-cellspacing: 0;
                      -premailer-width: 570px;
                      background-color: #ffffff;
                      border-color: #e8e5ef;
                      border-radius: 2px;
                      border-width: 1px;
                      box-shadow: 0 2px 0 rgba(0, 0, 150, 0.025),
                        2px 4px 0 rgba(0, 0, 150, 0.015);
                      margin: 0 auto;
                      padding: 0;
                      width: 570px;
                    "
                  >
                    <!-- Body content -->
                    <tr>
                      <td
                        class="content-cell"
                        style="
                          box-sizing: border-box;
                          font-family: -apple-system, BlinkMacSystemFont,
                            'Segoe UI', Roboto, Helvetica, Arial, sans-serif,
                            'Apple Color Emoji', 'Segoe UI Emoji',
                            'Segoe UI Symbol';
                          position: relative;
                          max-width: 100vw;
                          padding: 32px;
                        "
                      >
                        <div style="text-align: center">
                          <img
                            alt="UnoPot logo"
                            src="https://landingfoliocom.imgix.net/store/collection/clarity-dashboard/images/logo-symbol.svg"
                            class="CToWUd a6T"
                            data-bit="iit"
                            tabindex="0"
                            width="50px"
                            height="50px"
                          />
                        </div>
                        <h2 style="
                        text-align: center;
                        color: #0d0c22;
                        font-family: Helvetica Neue Roman, Arial, sans-serif,
                          'Open Sans';
                      ">Task Notification</h2>

                      <div style="text-align: center">
                        <span style="font-size: 16px"> You recieved a task from ${user.profile.firstName} ${user.profile.lastName} click the button below to view the details</span
                          >
                      </div><br />
                        <p
                          style="
                            box-sizing: border-box;
                            font-family: -apple-system, BlinkMacSystemFont,
                              'Segoe UI', Roboto, Helvetica, Arial, sans-serif,
                              'Apple Color Emoji', 'Segoe UI Emoji',
                              'Segoe UI Symbol';
                            position: relative;
                            font-size: 16px;
                            line-height: 1.5em;
                            margin-top: 0;
                            text-align: left;
                          "
                        >
                        <table
                        class="subcopy"
                        width="100%"
                        cellpadding="0"
                        cellspacing="0"
                        role="presentation"
                      >
                        <tr>
                          <td colspan="2">
                            <div style="text-align: center">
                            <a
                                href="${config.datasite.urlClient}/task/${slug}/show"                           
                                style="
                                font-family: 'Google Sans', Roboto,
                                  RobotoDraft, Helvetica, Arial, sans-serif;
                                line-height: 16px;
                                color: #ffffff;
                                font-weight: 400;
                                text-decoration: none;
                                font-size: 14px;
                                display: inline-block;
                                padding: 15px 30px;
                                background-color: #4184f3;
                                border-radius: 5px;
                                min-width: 90px;
                              "
                              target="_blank"
                              >Show task</a
                            >
                          </div>
                          </td>
                        </tr>
                      </table>
                          Thanks,<br />The ${config.datasite.name} Team
                        </p>
  
                        <table
                          class="subcopy"
                          width="100%"
                          cellpadding="0"
                          cellspacing="0"
                          role="presentation"
                          style="
                            box-sizing: border-box;
                            font-family: -apple-system, BlinkMacSystemFont,
                              'Segoe UI', Roboto, Helvetica, Arial, sans-serif,
                              'Apple Color Emoji', 'Segoe UI Emoji',
                              'Segoe UI Symbol';
                            position: relative;
                            border-top: 1px solid #e8e5ef;
                            margin-top: 25px;
                            padding-top: 25px;
                          "
                        >
                          <tr>
                            <td
                              style="
                                box-sizing: border-box;
                                font-family: -apple-system, BlinkMacSystemFont,
                                  'Segoe UI', Roboto, Helvetica, Arial, sans-serif,
                                  'Apple Color Emoji', 'Segoe UI Emoji',
                                  'Segoe UI Symbol';
                                position: relative;
                              "
                            >
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
  
              <tr>
                <td
                  style="
                    box-sizing: border-box;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                      Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji',
                      'Segoe UI Emoji', 'Segoe UI Symbol';
                    position: relative;
                  "
                >
                  <table
                    class="footer"
                    align="center"
                    width="570"
                    cellpadding="0"
                    cellspacing="0"
                    role="presentation"
                    style="
                      box-sizing: border-box;
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                        Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji',
                        'Segoe UI Emoji', 'Segoe UI Symbol';
                      position: relative;
                      -premailer-cellpadding: 0;
                      -premailer-cellspacing: 0;
                      -premailer-width: 570px;
                      margin: 0 auto;
                      padding: 0;
                      text-align: center;
                      width: 570px;
                    "
                  >
                    <tr></tr>
                    <tr>
                      <td
                        style="
                          font-family: Montserrat, -apple-system, 'Segoe UI',
                            sans-serif;
                          font-size: 12px;
                          padding-left: 48px;
                          padding-right: 48px;
                          --text-opacity: 1;
                          color: #eceff1;
                          color: rgba(236, 239, 241, var(--text-opacity));
                          padding: 20px;
                        "
                      >
                        <p
                          style="
                            --text-opacity: 1;
                            color: #263238;
                            color: rgba(38, 50, 56, var(--text-opacity));
                          "
                        >
                          Use of our service and website is subject to our
                          <a
                            href="${config.datasite.urlClient}/terms-condition"
                            class="hover-underline"
                            style="
                              --text-opacity: 1;
                              color: #7367f0;
                              color: rgba(115, 103, 240, var(--text-opacity));
                              text-decoration: none;
                            "
                            >Terms of Use</a
                          >
                          and
                          <a
                            href="${config.datasite.urlClient}/privacy-policy"
                            class="hover-underline"
                            style="
                              --text-opacity: 1;
                              color: #7367f0;
                              color: rgba(115, 103, 240, var(--text-opacity));
                              text-decoration: none;
                            "
                            >Privacy Policy</a
                          >.
                        </p>
                        <p
                          style="
                            box-sizing: border-box;
                            font-family: -apple-system, BlinkMacSystemFont,
                              'Segoe UI', Roboto, Helvetica, Arial, sans-serif,
                              'Apple Color Emoji', 'Segoe UI Emoji',
                              'Segoe UI Symbol';
                            position: relative;
                            line-height: 1.5em;
                            margin-top: 0;
                            color: #b0adc5;
                            font-size: 12px;
                            text-align: center;
                          "
                        >
                          © 2024 - ${new Date().getFullYear()} ${
                            config.datasite.name
                          }. All rights reserved.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
      `;
  await sendEmail({
    from: `${config.implementations.resendSMTP.noReplayFrom}`,
    to: [email],
    subject: `${config.datasite.name} - User Task Notification`,
    html: output,
  });
};
