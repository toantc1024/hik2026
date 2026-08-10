import { ActionIcon, Container, Group, Text } from "@mantine/core";
import classes from "./FooterLinks.module.css";

const data = [
  {
    title: "Liên kết",
    links: [
      {
        label: "Website",
        link: "https://hcmute.edu.vn",
      },
      {
        label: "Facebook Đoàn Thanh niên",
        link: "mailto:Doantruong@hcmute.edu.vn",
      },
      {
        label: "Facebook Hội Sinh viên",
        link: "mailto:Dhspkt@hoisinhvien.vn",
      },
    ],
  },
];

export default function FooterLinks() {
  const groups = data.map((group) => {
    const links = group.links.map((link, index) => (
      <Text
        key={index}
        className={classes.link}
        component="a"
        href={link.link}
        onClick={(event) => {
          event.preventDefault();
          window.open(link.link, "_blank");
        }}
      >
        {link.label}
      </Text>
    ));

    return (
      <div className={classes.wrapper} key={group.title}>
        <Text className={classes.title}>{group.title}</Text>
        {links}
      </div>
    );
  });

  return (
    <footer className={classes.footer} >
      <Text c="dimmed" size="md" style={{
        textAlign: 'center',
        width: '100%'
      }}>
        © 2026 HCM-UTE
      </Text>

    </footer>
  );
}
