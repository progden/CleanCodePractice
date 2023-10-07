public class BloodType {
    public static final BloodType A = new BloodType("A");
    public static final BloodType B = new BloodType("B");
    public static final BloodType AB = new BloodType("AB");
    public static final BloodType O = new BloodType("O");

    private final String bloodType;

    private BloodType(String bloodType) {
        this.bloodType = bloodType;
    }
}
