import { TextInput } from "@mantine/core";

export default function FormInputs({ formData, setFormData }) {
    return (
        <>
            <TextInput
                size="lg"
                radius="xl"
                value={formData.name}
                onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Nhập Tên Đồng Chí"
                label="TÊN ĐỒNG CHÍ"
                styles={{ label: { fontSize: "1rem", fontWeight: 500 } }}
            />

        </>
    );
}
